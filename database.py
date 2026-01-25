import sqlite3
import os

def get_connection():
    # Obtém o diretório raiz do projeto
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Define o caminho do banco: PetClin/backend/database/petclin.db
    db_path = os.path.join(base_dir, 'backend', 'database', 'petclin.db')
    
    # Garante que a pasta do banco existe
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn