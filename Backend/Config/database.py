import sqlite3
import os
from pathlib import Path

# Caminho absoluto para o banco de dados
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "petclin.db"


def get_connection():
    """
    Retorna uma conexão com o banco de dados SQLite.
    """
    # Garante que o diretório existe e converte o caminho para string (evita erros no Windows)
    os.makedirs(os.path.dirname(str(DB_PATH)), exist_ok=True)
    connection = sqlite3.connect(str(DB_PATH))
    connection.row_factory = sqlite3.Row
    return connection
