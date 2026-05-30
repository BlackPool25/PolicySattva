import logging
import json
import socket
from pathlib import Path
from typing import Any

from neo4j import AsyncGraphDatabase

from llm_provider import get_active_rag_storage_dir
from neo4j_connection import Neo4jTarget, _candidate_targets


logger = logging.getLogger(__name__)

_async_driver = None
_active_target: Neo4jTarget | None = None


def _neo4j_reachable() -> bool:
    for target in _candidate_targets():
        if not target.password:
            continue
        try:
            host = target.uri.split("://")[-1].split(":")[0]
            port_str = target.uri.split("://")[-1].split(":")[-1] if ":" in target.uri.split("://")[-1] else "7687"
            port = int(port_str) if port_str.isdigit() else 7687
            with socket.create_connection((host, port), timeout=2):
                return True
        except Exception:
            continue
    return False


def _graph_from_networkx_json(company_id: str, doc_filter: str | None) -> dict[str, Any]:
    """Read graph data from LightRAG's NetworkX graphml file."""
    company_dir = get_active_rag_storage_dir() / company_id
    graphml = company_dir / "graph_chunk_entity_relation.graphml"
    if not graphml.exists():
        return _empty_graph()
    try:
        import xml.etree.ElementTree as ET
        tree = ET.parse(graphml)
        root = tree.getroot()
        ns = "http://graphml.graphdrawing.org/xmlns"

        # Build key-id → attr-name map
        key_map: dict[str, str] = {}
        for key_el in root.findall(f"{{{ns}}}key"):
            key_map[key_el.get("id", "")] = key_el.get("attr.name", "")

        nodes, edges = [], []
        graph_el = root.find(f"{{{ns}}}graph")
        if graph_el is None:
            return _empty_graph()

        for node_el in graph_el.findall(f"{{{ns}}}node"):
            node_id = node_el.get("id", "")
            # Prefer entity_id data element if present
            for data_el in node_el.findall(f"{{{ns}}}data"):
                if key_map.get(data_el.get("key", "")) == "entity_id":
                    node_id = data_el.text or node_id
                    break
            if node_id:
                nodes.append({"id": node_id, "label": node_id, "type": "entity"})

        node_ids = {n["id"] for n in nodes}
        for edge_el in graph_el.findall(f"{{{ns}}}edge"):
            src = edge_el.get("source", "")
            tgt = edge_el.get("target", "")
            label = "RELATED_TO"
            for data_el in edge_el.findall(f"{{{ns}}}data"):
                if key_map.get(data_el.get("key", "")) == "keywords":
                    kw = (data_el.text or "").split(",")[0].strip().upper().replace(" ", "_")
                    if kw:
                        label = kw
                    break
            if src in node_ids and tgt in node_ids:
                edges.append({"source": src, "target": tgt, "label": label})

        return {
            "nodes": nodes[:300],
            "edges": edges[:300],
            "stats": {"node_count": len(nodes), "edge_count": len(edges)},
        }
    except Exception as exc:
        logger.warning("Failed to read NetworkX graph for %s: %s", company_id, exc)
        return _empty_graph()
def _safe_load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _chunk_ids_for_doc_filter(doc_filter: str | None, company_id: str) -> list[str]:
    filter_name = (doc_filter or "").strip().lower()
    if not filter_name:
        return []

    company_dir = get_active_rag_storage_dir() / company_id
    full_docs = _safe_load_json(company_dir / "kv_store_full_docs.json")
    doc_status = _safe_load_json(company_dir / "kv_store_doc_status.json")
    matching_doc_ids: list[str] = []

    for doc_id, info in full_docs.items():
        if not isinstance(info, dict):
            continue
        file_path = str(info.get("file_path", "")).strip().lower()
        if not file_path:
            continue
        if filter_name in file_path or file_path.endswith(filter_name):
            matching_doc_ids.append(str(doc_id))

    chunk_ids: list[str] = []
    for doc_id in matching_doc_ids:
        status_data = doc_status.get(doc_id, {})
        if not isinstance(status_data, dict):
            continue
        chunks_list = status_data.get("chunks_list", [])
        if not isinstance(chunks_list, list):
            continue
        for chunk in chunks_list:
            chunk_id = str(chunk).strip()
            if chunk_id:
                chunk_ids.append(chunk_id)
    return chunk_ids


def _empty_graph() -> dict[str, Any]:
    return {
        "nodes": [],
        "edges": [],
        "stats": {"node_count": 0, "edge_count": 0},
    }


async def _get_driver_and_target() -> tuple[Any, Neo4jTarget]:
    global _async_driver, _active_target

    if _async_driver is not None and _active_target is not None:
        return _async_driver, _active_target

    errors: list[str] = []
    for target in _candidate_targets():
        if not target.password:
            errors.append(f"{target.name}: missing password")
            continue
        try:
            candidate = AsyncGraphDatabase.driver(
                target.uri,
                auth=(target.username, target.password),
            )
            await candidate.verify_connectivity()
            _async_driver = candidate
            _active_target = target
            return _async_driver, _active_target
        except Exception as exc:
            errors.append(f"{target.name}: {exc}")

    raise RuntimeError("Unable to connect to Neo4j. " + "; ".join(errors))


async def get_full_graph() -> dict[str, Any]:
    return await get_full_graph_for_doc(None, company_id="base")


async def get_full_graph_for_doc(doc_filter: str | None, company_id: str = "base") -> dict[str, Any]:
    if not _neo4j_reachable():
        return _graph_from_networkx_json(company_id, doc_filter)
    try:
        driver, target = await _get_driver_and_target()
        chunk_ids = _chunk_ids_for_doc_filter(doc_filter, company_id)
        use_doc_filter = bool((doc_filter or "").strip()) and len(chunk_ids) > 0

        node_records, _, _ = await driver.execute_query(
            f"""
            MATCH (n:`{company_id}`) WHERE n.entity_id IS NOT NULL
            AND (
              $use_doc_filter = false OR
              any(chunk in $chunk_ids WHERE toLower(coalesce(n.source_id, '')) CONTAINS toLower(chunk))
            )
            RETURN n.entity_id AS id
            LIMIT 300
            """,
            use_doc_filter=use_doc_filter,
            chunk_ids=chunk_ids,
            database_=target.database,
        )
        edge_records, _, _ = await driver.execute_query(
            f"""
            MATCH (n:`{company_id}`)-[r]->(m:`{company_id}`)
            WHERE n.entity_id IS NOT NULL AND m.entity_id IS NOT NULL
            AND (
              $use_doc_filter = false OR
              any(chunk in $chunk_ids WHERE toLower(coalesce(n.source_id, '')) CONTAINS toLower(chunk))
              OR
              any(chunk in $chunk_ids WHERE toLower(coalesce(m.source_id, '')) CONTAINS toLower(chunk))
            )
            RETURN n.entity_id AS source, m.entity_id AS target, type(r) AS label
            LIMIT 300
            """,
            use_doc_filter=use_doc_filter,
            chunk_ids=chunk_ids,
            database_=target.database,
        )

        nodes = [
            {"id": str(record["id"]), "label": str(record["id"]), "type": "entity"}
            for record in node_records
            if record.get("id")
        ]

        node_ids = {node["id"] for node in nodes}
        edges = [
            {
                "source": str(record["source"]),
                "target": str(record["target"]),
                "label": str(record["label"]),
            }
            for record in edge_records
            if record.get("source") and record.get("target") and record.get("label")
            and str(record["source"]) in node_ids
            and str(record["target"]) in node_ids
        ]

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {"node_count": len(nodes), "edge_count": len(edges)},
        }
    except Exception as exc:
        logger.exception("Failed to fetch full graph: %s", exc)
        return _empty_graph()


async def get_subgraph(node_ids: list[str]) -> dict[str, Any]:
    return await get_subgraph_for_doc(node_ids=node_ids, doc_filter=None, company_id="base")


async def get_subgraph_for_doc(node_ids: list[str], doc_filter: str | None, company_id: str = "base") -> dict[str, Any]:
    if not node_ids:
        return _empty_graph()
    if not _neo4j_reachable():
        # Filter the full NetworkX graph to the requested node IDs
        full = _graph_from_networkx_json(company_id, doc_filter)
        requested = set(node_ids)
        nodes = [n for n in full["nodes"] if n["id"] in requested]
        node_set = {n["id"] for n in nodes}
        edges = [e for e in full["edges"] if e["source"] in node_set and e["target"] in node_set]
        return {"nodes": nodes, "edges": edges, "stats": {"node_count": len(nodes), "edge_count": len(edges)}}
    try:
        driver, target = await _get_driver_and_target()
        chunk_ids = _chunk_ids_for_doc_filter(doc_filter, company_id)
        use_doc_filter = bool((doc_filter or "").strip()) and len(chunk_ids) > 0

        records, _, _ = await driver.execute_query(
            f"""
            MATCH (n:`{company_id}`) WHERE n.entity_id IN $node_ids
            AND (
              $use_doc_filter = false OR
              any(chunk in $chunk_ids WHERE toLower(coalesce(n.source_id, '')) CONTAINS toLower(chunk))
            )
            OPTIONAL MATCH (n)-[r]-(m:`{company_id}`) WHERE m.entity_id IN $node_ids
            AND (
              $use_doc_filter = false OR
              any(chunk in $chunk_ids WHERE toLower(coalesce(m.source_id, '')) CONTAINS toLower(chunk))
            )
            RETURN n.entity_id AS node_id,
                   m.entity_id AS connected_id,
                   type(r) AS rel_label,
                   startNode(r).entity_id AS src,
                   endNode(r).entity_id AS tgt
            """,
            node_ids=node_ids,
            use_doc_filter=use_doc_filter,
            chunk_ids=chunk_ids,
            database_=target.database,
        )

        nodes_set: set[str] = set()
        edges_set: set[tuple[str, str, str]] = set()

        for record in records:
            node_id = record.get("node_id")
            connected_id = record.get("connected_id")
            src = record.get("src")
            tgt = record.get("tgt")
            label = record.get("rel_label")

            if node_id:
                nodes_set.add(str(node_id))
            if connected_id:
                nodes_set.add(str(connected_id))
            if src and tgt and label:
                edges_set.add((str(src), str(tgt), str(label)))

        nodes = [{"id": nid, "label": nid, "type": "entity"} for nid in sorted(nodes_set)]
        edges = [
            {"source": source, "target": tgt, "label": label}
            for source, tgt, label in sorted(edges_set)
        ]

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {"node_count": len(nodes), "edge_count": len(edges)},
        }
    except Exception as exc:
        logger.exception("Failed to fetch subgraph: %s", exc)
        return _empty_graph()


async def get_node_details(node_id: str) -> dict[str, Any]:
    if not node_id:
        return {"id": node_id, "label": node_id, "description": "", "type": "entity", "source_files": []}

    try:
        driver, target = await _get_driver_and_target()

        records, _, _ = await driver.execute_query(
            """
            MATCH (n) WHERE n.entity_id = $node_id
            RETURN n.entity_id AS id,
                   n.description AS description,
                   n.entity_type AS entity_type,
                   n.source_id AS source_id
            LIMIT 1
            """,
            node_id=node_id,
            database_=target.database,
        )

        if not records:
            return {"id": node_id, "label": node_id, "description": "", "type": "entity", "source_files": []}

        record = records[0]
        description = str(record.get("description") or "").strip()
        entity_type = str(record.get("entity_type") or "entity").strip()
        source_id = str(record.get("source_id") or "").strip()

        # source_id is comma-separated chunk IDs; surface the first few as hints
        source_hints = [s.strip() for s in source_id.split(",") if s.strip()][:3]

        return {
            "id": node_id,
            "label": node_id,
            "description": description,
            "type": entity_type,
            "source_files": source_hints,
        }
    except Exception as exc:
        logger.exception("Failed to fetch node details for %s: %s", node_id, exc)
        return {"id": node_id, "label": node_id, "description": "", "type": "entity", "source_files": []}