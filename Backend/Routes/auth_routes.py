from flask import Blueprint, request, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@auth_bp.route('/register', methods=['POST'])
def register():
    # Rota opcional: Em produção, geralmente apenas Admins criam usuários
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('senha') or not data.get('nome'):
        return jsonify({'error': 'Dados incompletos'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verificar duplicidade
    user = cursor.execute('SELECT id FROM usuarios WHERE email = ?', (data['email'],)).fetchone()
    if user:
        conn.close()
        return jsonify({'error': 'Email já cadastrado'}), 400
        
    senha_hash = generate_password_hash(data['senha'])
    
    try:
        cursor.execute('''
            INSERT INTO usuarios (nome, email, senha, tipo, clinica_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['nome'], 
            data['email'], 
            senha_hash, 
            data.get('tipo', 'Veterinário'),
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
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({'error': 'Email e senha obrigatórios'}), 400
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM usuarios WHERE email = ?', (data['email'],)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['senha'], data['senha']):
        session.clear()
        # Definindo a sessão conforme especificado no início do projeto
        session['user_id'] = user['id']
        session['user_nome'] = user['nome']
        session['user_tipo'] = user['tipo']
        session['clinica_id'] = user['clinica_id']
        
        return jsonify({
            'message': 'Login realizado',
            'user': {
                'id': user['id'],
                'nome': user['nome'],
                'tipo': user['tipo']
            }
        })
        
    return jsonify({'error': 'Credenciais inválidas'}), 401

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
            'tipo': session['user_tipo'],
            'clinica_id': session['clinica_id']
        }
    })