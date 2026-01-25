import sqlite3
import os
from werkzeug.security import generate_password_hash

def init_db():
    # Caminho absoluto para o banco
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'backend', 'database', 'petclin.db')
    
    # Garante que o diretório existe
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    print(f"Conectando ao banco em: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Cria tabela de usuários se não existir
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            clinica_id INTEGER,
            tipo TEXT
        );
    """)
    
    # Verifica se já existe algum usuário
    cursor.execute("SELECT count(*) FROM usuarios")
    if cursor.fetchone()[0] == 0:
        print("Criando usuário administrador padrão...")
        senha_hash = generate_password_hash("123456")
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha, clinica_id, tipo)
            VALUES (?, ?, ?, ?, ?)
        """, ("Administrador", "admin@petclin.com", senha_hash, 1, "admin"))
        print("Usuário criado: admin@petclin.com")
        print("Senha: 123456")

    conn.commit()
    conn.close()
    print("Tabela 'usuarios' verificada/criada com sucesso!")

if __name__ == "__main__":
    init_db()