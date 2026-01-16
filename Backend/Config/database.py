import sqlite3
from pathlib import Path

# Caminho absoluto para o banco de dados
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "petclin.db"


def get_connection():
    """
    Retorna uma conexão com o banco de dados SQLite.
    """
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection
