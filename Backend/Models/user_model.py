from config.database import get_connection


class UserModel:
    """
    Camada de acesso a dados da entidade Usuário.
    """

    @staticmethod
    def create(nome, email, senha, clinica_id, tipo):
        connection = get_connection()
        try:
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO usuarios (nome, email, senha, clinica_id, tipo)
                VALUES (?, ?, ?, ?, ?)
            """, (nome, email, senha, clinica_id, tipo))
            connection.commit()
            return cursor.lastrowid
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()

    @staticmethod
    def find_by_email(email):
        connection = get_connection()
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
            return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def find_by_id(user_id):
        connection = get_connection()
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM usuarios WHERE id = ?", (user_id,))
            return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def update(user_id, nome, email, tipo):
        connection = get_connection()
        try:
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE usuarios
                SET nome = ?, email = ?, tipo = ?
                WHERE id = ?
            """, (nome, email, tipo, user_id))
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()

    @staticmethod
    def delete(user_id):
        connection = get_connection()
        try:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM usuarios WHERE id = ?", (user_id,))
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
