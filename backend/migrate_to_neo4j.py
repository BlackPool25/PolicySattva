import os
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from neo4j import GraphDatabase

# Load settings
sys.path.append(str(Path(__file__).resolve().parent))
from llm_provider import get_active_rag_storage_dir
from neo4j_connection import get_neo4j_driver_with_fallback, _candidate_targets

def _safe_company_id(raw: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]", "_", raw.strip()).strip("_")
    return slug.lower()

def _keywords_to_rel_type(keywords: str) -> str:
    if not keywords:
        return "RELATED_TO"
    first_kw = keywords.split(",")[0].strip()
    sanitized = re.sub(r"[^a-zA-Z0-9 ]", "", first_kw)
    return sanitized.strip().upper().replace(" ", "_") or "RELATED_TO"

def parse_graphml(graphml_path: Path) -> tuple[list[dict], list[dict]]:
    """Parse GraphML into nodes and edges list with exact properties."""
    if not graphml_path.exists():
        return [], []
        
    tree = ET.parse(graphml_path)
    root = tree.getroot()
    ns = "http://graphml.graphdrawing.org/xmlns"

    # Build key mapping
    key_map: dict[str, str] = {}
    for key_el in root.findall(f"{{{ns}}}key"):
        key_map[key_el.get("id", "")] = key_el.get("attr.name", "")

    nodes, edges = [], []
    graph_el = root.find(f"{{{ns}}}graph")
    if graph_el is None:
        return [], []

    for node_el in graph_el.findall(f"{{{ns}}}node"):
        node_id = node_el.get("id", "")
        props = {"entity_id": node_id, "entity_type": "entity", "description": "", "source_id": ""}
        for data_el in node_el.findall(f"{{{ns}}}data"):
            attr_name = key_map.get(data_el.get("key", ""))
            if attr_name == "entity_type":
                props["entity_type"] = data_el.text or "entity"
            elif attr_name == "description":
                props["description"] = data_el.text or ""
            elif attr_name == "source_id":
                props["source_id"] = data_el.text or ""
        nodes.append(props)

    for edge_el in graph_el.findall(f"{{{ns}}}edge"):
        src = edge_el.get("source", "")
        tgt = edge_el.get("target", "")
        props = {
            "source": src,
            "target": tgt,
            "weight": 1.0,
            "description": "",
            "keywords": "",
            "source_id": ""
        }
        for data_el in edge_el.findall(f"{{{ns}}}data"):
            attr_name = key_map.get(data_el.get("key", ""))
            if attr_name == "weight":
                try:
                    props["weight"] = float(data_el.text or "1.0")
                except ValueError:
                    props["weight"] = 1.0
            elif attr_name == "description":
                props["description"] = data_el.text or ""
            elif attr_name == "keywords":
                props["keywords"] = data_el.text or ""
            elif attr_name == "source_id":
                props["source_id"] = data_el.text or ""
        edges.append(props)

    return nodes, edges

def migrate_company(company_id: str, driver, database: str):
    company_dir = get_active_rag_storage_dir() / company_id
    graphml_path = company_dir / "graph_chunk_entity_relation.graphml"
    
    if not graphml_path.exists():
        print(f"[-] No local GraphML file found for company '{company_id}'. Skipping.")
        return

    print(f"[*] Parsing GraphML for '{company_id}' from {graphml_path}...")
    nodes, edges = parse_graphml(graphml_path)
    print(f"[+] Found {len(nodes)} nodes and {len(edges)} edges to migrate.")

    if not nodes:
        return

    with driver.session(database=database) as session:
        # 1. Clean existing nodes for this company label (workspace-scoped refresh)
        print(f"[*] Cleaning up old nodes labeled `{company_id}` in Neo4j...")
        session.run(f"MATCH (n:`{company_id}`) DETACH DELETE n")

        # 2. Insert Nodes
        print(f"[*] Migrating nodes to Neo4j...")
        for node in nodes:
            query = f"""
            MERGE (n:`{company_id}` {{entity_id: $entity_id}})
            SET n.entity_type = $entity_type,
                n.description = $description,
                n.source_id = $source_id
            RETURN n
            """
            session.run(
                query,
                entity_id=node["entity_id"],
                entity_type=node["entity_type"],
                description=node["description"],
                source_id=node["source_id"]
            )

        # 3. Insert Edges
        print(f"[*] Migrating edges to Neo4j...")
        for edge in edges:
            rel_type = _keywords_to_rel_type(edge["keywords"])
            query = f"""
            MATCH (source:`{company_id}` {{entity_id: $source}})
            MATCH (target:`{company_id}` {{entity_id: $target}})
            MERGE (source)-[r:{rel_type}]-(target)
            SET r.weight = $weight,
                r.description = $description,
                r.keywords = $keywords,
                r.source_id = $source_id
            """
            session.run(
                query,
                source=edge["source"],
                target=edge["target"],
                weight=edge["weight"],
                description=edge["description"],
                keywords=edge["keywords"],
                source_id=edge["source_id"]
            )
            
    print(f"[+] Successfully migrated company '{company_id}' graph index to Neo4j.")

def main():
    print("="*60)
    print(" POLICY SATTVA — GRAPH INDEX NEO4J MIGRATION ")
    print("="*60)
    
    # Check candidates
    targets = _candidate_targets()
    if not targets:
        print("[!] No Neo4j targets configured in .env. Exiting.")
        sys.exit(1)
        
    print("[*] Verifying connectivity to Neo4j...")
    try:
        driver, target = get_neo4j_driver_with_fallback()
        print(f"[+] Connected to Neo4j Target: {target.name} ({target.uri}) database={target.database}")
    except Exception as e:
        print(f"[!] Connection failed: {e}")
        sys.exit(1)

    base_dir = get_active_rag_storage_dir()
    if not base_dir.exists():
        print(f"[-] Active embedding index namespace directory does not exist at {base_dir}. Nothing to migrate.")
        sys.exit(0)

    # Scan for subdirectories
    companies = [f.name for f in base_dir.iterdir() if f.is_dir()]
    if not companies:
        print(f"[-] No company index directories found under {base_dir}.")
        sys.exit(0)
        
    print(f"[+] Discovered company indices: {companies}")
    for company in companies:
        safe = _safe_company_id(company)
        migrate_company(safe, driver, target.database)
        
    driver.close()
    print("="*60)
    print(" MIGRATION SUCCESSFUL! ")
    print("="*60)

if __name__ == "__main__":
    main()
