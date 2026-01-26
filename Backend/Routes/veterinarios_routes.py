from flask import Blueprint, request, jsonify
import sqlite3
from flask_jwt_extended import jwt_required, get_jwt

veterinarios_bp = Blueprint('veterinarios_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@veterinarios_bp.route('/', methods=['GET'])
@jwt_required()
def get_veterinarios():
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    veterinarios = conn.execute('SELECT * FROM veterinarios WHERE clinica_id = ?', (clinica_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in veterinarios])

@veterinarios_bp.route('/', methods=['POST'])
@jwt_required()
def create_veterinario():
    clinica_id = get_jwt().get('clinica_id')
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            'INSERT INTO veterinarios (nome, crmv, telefone, email, especialidade, clinica_id) VALUES (?, ?, ?, ?, ?, ?)',
            (data['nome'], data.get('crmv'), data.get('telefone'), data.get('email'), data.get('especialidade'), clinica_id)
        )
        conn.commit()
        new_id = cursor.lastrowid
        veterinario = conn.execute('SELECT * FROM veterinarios WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(veterinario)), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@veterinarios_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_veterinario(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    veterinario = conn.execute('SELECT * FROM veterinarios WHERE id = ? AND clinica_id = ?', (id, clinica_id)).fetchone()
    conn.close()
    if veterinario is None:
        return jsonify({'error': 'Veterinário não encontrado'}), 404
    return jsonify(dict(veterinario))

@veterinarios_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_veterinario(id):
    clinica_id = get_jwt().get('clinica_id')
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE veterinarios SET nome = ?, crmv = ?, telefone = ?, email = ?, especialidade = ? WHERE id = ? AND clinica_id = ?',
        (data['nome'], data.get('crmv'), data.get('telefone'), data.get('email'), data.get('especialidade'), id, clinica_id)
    )
    conn.commit()
    veterinario = conn.execute('SELECT * FROM veterinarios WHERE id = ? AND clinica_id = ?', (id, clinica_id)).fetchone()
    conn.close()
    return jsonify(dict(veterinario) if veterinario else {})

@veterinarios_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_veterinario(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    conn.execute('DELETE FROM veterinarios WHERE id = ? AND clinica_id = ?', (id, clinica_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Veterinário excluído com sucesso'})