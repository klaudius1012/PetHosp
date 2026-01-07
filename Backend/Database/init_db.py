from pathlib import Path
import sqlite3

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "petclin.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def create_database():
    connection = sqlite3.connect(DB_PATH)

    with open(SCHEMA_PATH, "r", encoding="utf-8") as schema_file:
        connection.executescript(schema_file.read())

    connection.close()
    print("Banco de dados criado com sucesso!")


if __name__ == "__main__":
    create_database()
