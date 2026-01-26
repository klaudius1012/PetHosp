from flask import Blueprint, request, jsonify
import sqlite3
from flask_jwt_extended import jwt_required, get_jwt

tutores_bp = Blueprint('tutores_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@tutores_bp.route('/', methods=['GET'])
@jwt_required()
def get_tutores():
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    tutores = conn.execute('SELECT * FROM tutores WHERE clinica_id = ? ORDER BY nome', (clinica_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in tutores])

@tutores_bp.route('/', methods=['POST'])
@jwt_required()
def create_tutor():
    clinica_id = get_jwt().get('clinica_id')
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            'INSERT INTO tutores (nome, cpf, telefone, email, endereco, clinica_id) VALUES (?, ?, ?, ?, ?, ?)',
            (data.get('nome'), data.get('cpf'), data.get('telefone'), data.get('email'), data.get('endereco'), clinica_id)
        )
        conn.commit()
        new_id = cursor.lastrowid
        tutor = conn.execute('SELECT * FROM tutores WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(tutor)), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@tutores_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_tutor(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    tutor = conn.execute('SELECT * FROM tutores WHERE id = ? AND clinica_id = ?', (id, clinica_id)).fetchone()
    conn.close()
    if tutor is None:
        return jsonify({'error': 'Tutor não encontrado'}), 404
    return jsonify(dict(tutor))

@tutores_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_tutor(id):
    clinica_id = get_jwt().get('clinica_id')
    data = request.json
    conn = get_db_connection()
    
    campos = ['nome', 'cpf', 'telefone', 'email', 'endereco']
    set_clause = [f"{c} = ?" for c in campos if c in data]
    valores = [data[c] for c in campos if c in data]
    
    if not valores:
        conn.close()
        return jsonify({'message': 'Nada a atualizar'}), 200

    valores.append(id)
    valores.append(clinica_id)
    conn.execute(f"UPDATE tutores SET {', '.join(set_clause)} WHERE id = ? AND clinica_id = ?", valores)
    conn.commit()
    tutor = conn.execute('SELECT * FROM tutores WHERE id = ? AND clinica_id = ?', (id, clinica_id)).fetchone()
    conn.close()
    return jsonify(dict(tutor) if tutor else {})

@tutores_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_tutor(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    conn.execute('DELETE FROM tutores WHERE id = ? AND clinica_id = ?', (id, clinica_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Tutor excluído com sucesso'})