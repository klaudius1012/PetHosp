from flask import Blueprint, request, jsonify
from controllers.auth_controller import AuthController

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")
    clinica_id = data.get("clinica_id")
    tipo = data.get("tipo")

    if not all([nome, email, senha, clinica_id, tipo]):
        return jsonify({"error": "Dados incompletos"}), 400

    AuthController.register_user(nome, email, senha, clinica_id, tipo)

    return jsonify({"message": "Usuário registrado com sucesso"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    senha = data.get("senha")

    if not all([email, senha]):
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    usuario = AuthController.login_user(email, senha)

    if not usuario:
        return jsonify({"error": "Credenciais inválidas"}), 401

    return jsonify({
        "id": usuario["id"],
        "nome": usuario["nome"],
        "email": usuario["email"],
        "tipo": usuario["tipo"],
        "clinica_id": usuario["clinica_id"]
    }), 200
