import asyncio

from llm_provider import verify_gemini_api_key, verify_groq_api_key
from neo4j_connection import get_neo4j_driver_with_fallback


async def main() -> None:
    print("=== Provider checks ===")

    groq_ok, groq_message = await verify_groq_api_key()
    print(f"Groq: {'OK' if groq_ok else 'FAIL'} - {groq_message}")

    gemini_ok, gemini_message = await verify_gemini_api_key()
    print(f"Gemini: {'OK' if gemini_ok else 'FAIL'} - {gemini_message}")

    print("\n=== Neo4j check (cloud -> local fallback) ===")
    try:
        driver, target = get_neo4j_driver_with_fallback()
        try:
            print(f"Neo4j target selected: {target.name} ({target.uri})")

            # Connectivity probe without forcing database, to isolate auth/network issues.
            records, _, _ = driver.execute_query("RETURN 1 AS ok")
            value = records[0]["ok"] if records else None
            print(f"Neo4j connectivity: OK - probe={value}")

            # Database probe with configured name, to validate database setup.
            try:
                db_records, _, _ = driver.execute_query(
                    "RETURN 1 AS ok",
                    database_=target.database,
                )
                db_value = db_records[0]["ok"] if db_records else None
                print(f"Neo4j database '{target.database}': OK - probe={db_value}")
            except Exception as db_exc:
                print(f"Neo4j database '{target.database}': FAIL - {db_exc}")
        finally:
            driver.close()
    except Exception as exc:
        print(f"Neo4j: FAIL - {exc}")


if __name__ == "__main__":
    asyncio.run(main())