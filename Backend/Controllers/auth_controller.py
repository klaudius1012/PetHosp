from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import UserModel


class AuthController:
    """
    Camada de regras de negócio para autenticação de usuários.
    """

    @staticmethod
    def register_user(nome, email, senha, clinica_id, tipo):
        if not nome or not email or not senha:
            raise ValueError("Nome, email e senha são obrigatórios.")

        usuario_existente = UserModel.find_by_email(email)
        if usuario_existente:
            raise ValueError("Já existe um usuário com este email.")

        senha_hash = generate_password_hash(senha)

        UserModel.create(
            nome=nome,
            email=email,
            senha=senha_hash,
            clinica_id=clinica_id,
            tipo=tipo
        )

    @staticmethod
    def authenticate_user(email, senha):
        if not email or not senha:
            raise ValueError("Email e senha são obrigatórios.")

        usuario = UserModel.find_by_email(email)

        if not usuario:
            return None

        if not check_password_hash(usuario["senha"], senha):
            return None

        return usuario
