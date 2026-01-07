from config.database import get_connection
from werkzeug.security import generate_password_hash, check_password_hash

def criar_usuario(nome, email, senha, clinica_id, tipo):
    conn = get_connection()
    cursor = conn.cursor()

    senha_hash = generate_password_hash(senha)

    cursor.execute("""
        INSERT INTO usuarios (nome, email, senha, clinica_id, tipo)
        VALUES (?, ?, ?, ?, ?)
    """, (nome, email, senha_hash, clinica_id, tipo))

    conn.commit()
    conn.close()


def autenticar_usuario(email, senha):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
    usuario = cursor.fetchone()
    conn.close()

    if usuario and check_password_hash(usuario["senha"], senha):
        return usuario
    return None
