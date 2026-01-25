import sqlite3
import os
from werkzeug.security import generate_password_hash

def init_db():
    # Caminho para o arquivo do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'petclin.db')
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')

    print(f"Inicializando banco de dados em: {db_path}")

    connection = sqlite3.connect(db_path)
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        connection.executescript(f.read())

    # Criar usuário admin padrão se não existir
    cursor = connection.cursor()
    user = cursor.execute("SELECT * FROM usuarios WHERE email = 'admin@petclin.com'").fetchone()
    
    if not user:
        print("Criando usuário administrador padrão...")
        senha_hash = generate_password_hash('123456')
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
            ('Administrador', 'admin@petclin.com', senha_hash, 'admin')
        )

    connection.commit()
    connection.close()
    print("Banco de dados inicializado com sucesso!")

if __name__ == '__main__':
    init_db()