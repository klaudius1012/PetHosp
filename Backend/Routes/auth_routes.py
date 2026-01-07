from flask import Blueprint, request, jsonify
from controllers.auth_controller import criar_usuario, autenticar_usuario

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    criar_usuario(
        data["nome"],
        data["email"],
        data["senha"],
        data["clinica_id"],
        data["tipo"]
    )
    return jsonify({"message": "Usuário criado com sucesso"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    usuario = autenticar_usuario(data["email"], data["senha"])

    if usuario:
        return jsonify({"message": "Login OK", "usuario": dict(usuario)})
    return jsonify({"message": "Credenciais inválidas"}), 401
