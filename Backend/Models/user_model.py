from config.database import get_connection


class UserModel:
    """
    Camada de acesso a dados da entidade Usuário.
    """

    @staticmethod
    def create(nome, email, senha, clinica_id, tipo):
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha, clinica_id, tipo)
            VALUES (?, ?, ?, ?, ?)
        """, (nome, email, senha, clinica_id, tipo))

        connection.commit()
        connection.close()

    @staticmethod
    def find_by_email(email):
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT * FROM usuarios WHERE email = ?
        """, (email,))

        usuario = cursor.fetchone()
        connection.close()

        return usuario
