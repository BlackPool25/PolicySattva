import logging
from typing import Any

from neo4j import AsyncGraphDatabase

from neo4j_connection import Neo4jTarget, _candidate_targets


logger = logging.getLogger(__name__)

_async_driver = None
_active_target: Neo4jTarget | None = None


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
    try:
        driver, target = await _get_driver_and_target()

        node_records, _, _ = await driver.execute_query(
            """
            MATCH (n) WHERE n.entity_id IS NOT NULL
            RETURN n.entity_id AS id
            LIMIT 300
            """,
            database_=target.database,
        )
        edge_records, _, _ = await driver.execute_query(
            """
            MATCH (n)-[r]->(m)
            WHERE n.entity_id IS NOT NULL AND m.entity_id IS NOT NULL
            RETURN n.entity_id AS source, m.entity_id AS target, type(r) AS label
            LIMIT 300
            """,
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
    if not node_ids:
        return _empty_graph()

    try:
        driver, target = await _get_driver_and_target()

        records, _, _ = await driver.execute_query(
            """
            MATCH (n) WHERE n.entity_id IN $node_ids
            OPTIONAL MATCH (n)-[r]-(neighbor)
            WHERE neighbor.entity_id IS NOT NULL
            RETURN n.entity_id AS center,
                   neighbor.entity_id AS neighbor_id,
                   type(r) AS rel_label,
                   startNode(r).entity_id AS src,
                   endNode(r).entity_id AS tgt
            """,
            node_ids=node_ids,
            database_=target.database,
        )

        nodes_set: set[str] = set()
        edges_set: set[tuple[str, str, str]] = set()

        for record in records:
            center = record.get("center")
            neighbor = record.get("neighbor_id")
            src = record.get("src")
            tgt = record.get("tgt")
            label = record.get("rel_label")

            if center:
                nodes_set.add(str(center))
            if neighbor:
                nodes_set.add(str(neighbor))
            if src and tgt and label:
                edges_set.add((str(src), str(tgt), str(label)))

        nodes = [{"id": node_id, "label": node_id, "type": "entity"} for node_id in sorted(nodes_set)]
        edges = [
            {"source": source, "target": target, "label": label}
            for source, target, label in sorted(edges_set)
        ]

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {"node_count": len(nodes), "edge_count": len(edges)},
        }
    except Exception as exc:
        logger.exception("Failed to fetch subgraph: %s", exc)
        return _empty_graph()