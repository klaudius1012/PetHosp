from flask import Blueprint, request, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from backend.config.database import get_connection

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # Rota opcional: Em produção, geralmente apenas Admins criam usuários
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('senha') or not data.get('nome'):
        return jsonify({'error': 'Dados incompletos'}), 400
        
    conn = get_connection()
    cursor = conn.cursor()
    
    # Verificar duplicidade
    user = cursor.execute('SELECT id FROM usuarios WHERE email = ?', (data['email'],)).fetchone()
    if user: 
        conn.close()
        return jsonify({'error': 'Email já cadastrado'}), 400
        
    senha_hash = generate_password_hash(data['senha'])
    
    try:
        cursor.execute('''
            INSERT INTO usuarios (nome, email, senha, role, clinica_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['nome'], 
            data['email'], 
            senha_hash, 
            data.get('role', 'Veterinario'),
            data.get('clinica_id', 1)
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500
        
    conn.close()
    return jsonify({'message': 'Usuário criado com sucesso'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('senha'):
            return jsonify({'error': 'Email e senha obrigatórios'}), 400
            
        conn = get_connection()
        user = conn.execute('SELECT * FROM usuarios WHERE email = ?', (data['email'],)).fetchone()
        conn.close()
        
        if user and check_password_hash(user['senha'], data['senha']):
            session.clear()
            # Definindo a sessão conforme especificado no início do projeto
            session['user_id'] = user['id']
            session['user_nome'] = user['nome']
            session['user_role'] = user['role']
            session['clinica_id'] = user['clinica_id']
            
            access_token = create_access_token(identity=user['id'], additional_claims={'clinica_id': user['clinica_id'], 'role': user['role']})
            
            return jsonify({
                'message': 'Login realizado',
                'access_token': access_token,
                'user': {
                    'id': user['id'],
                    'nome': user['nome'],
                    'role': user['role']
                }
            })
            
        return jsonify({'error': 'Credenciais inválidas'}), 401
    except Exception as e:
        print(f"Erro no login: {e}") # Mostra o erro no terminal do servidor
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout realizado'})

@auth_bp.route('/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({'authenticated': False}), 401
        
    return jsonify({
        'authenticated': True,
        'user': {
            'id': session['user_id'],
            'nome': session['user_nome'],
            'role': session.get('user_role'),
            'clinica_id': session['clinica_id']
        }
    })