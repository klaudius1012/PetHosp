import sqlite3
import os
from werkzeug.security import generate_password_hash

def init_db():
    # Caminho absoluto para o banco
    base_dir = os.path.dirname(os.path.abspath(__file__))
    database_dir = os.path.join(base_dir, 'backend', 'database')
    db_path = os.path.join(database_dir, 'petclin.db')
    schema_path = os.path.join(database_dir, 'schema.sql')

    # Garante que o diretório existe
    os.makedirs(database_dir, exist_ok=True)

    print(f"Conectando ao banco em: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Executa o script SQL para criar/atualizar todas as tabelas
    print(f"Executando schema de: {schema_path}")
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    print("Schema do banco de dados aplicado com sucesso.")

    # Verifica se já existe alguma clínica
    cursor.execute("SELECT count(*) FROM clinicas")
    if cursor.fetchone()[0] == 0:
        print("Nenhuma clínica encontrada. Criando clínica padrão...")
        cursor.execute("""
            INSERT INTO clinicas (id, nome, cnpj, endereco, telefone)
            VALUES (?, ?, ?, ?, ?)
        """, (1, "Clínica Padrão", "00.000.000/0001-00", "Endereço Padrão", "(00) 00000-0000"))
        print("Clínica Padrão criada com ID 1.")

    # Verifica se já existe algum usuário administrador
    cursor.execute("SELECT count(*) FROM usuarios")
    if cursor.fetchone()[0] == 0:
        print("Criando usuário administrador padrão...")
        senha_hash = generate_password_hash("123456")
        cursor.execute("""
            INSERT INTO usuarios (username, password_hash, clinica_id, role)
            VALUES (?, ?, ?, ?)
        """, ("admin@petclin.com", senha_hash, 1, "admin"))
        print("Usuário administrador criado: admin@petclin.com")
        print("Senha: 123456")

    conn.commit()
    conn.close()
    print("Inicialização do banco de dados concluída com sucesso!")

if __name__ == "__main__":
    init_db()