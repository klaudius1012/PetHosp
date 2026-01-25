from flask import Blueprint, request, jsonify
import sqlite3

veterinarios_bp = Blueprint('veterinarios_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@veterinarios_bp.route('/', methods=['GET'])
def get_veterinarios():
    conn = get_db_connection()
    veterinarios = conn.execute('SELECT * FROM veterinarios').fetchall()
    conn.close()
    return jsonify([dict(row) for row in veterinarios])

@veterinarios_bp.route('/', methods=['POST'])
def create_veterinario():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            'INSERT INTO veterinarios (nome, crmv, telefone, email, especialidade) VALUES (?, ?, ?, ?, ?)',
            (data['nome'], data.get('crmv'), data.get('telefone'), data.get('email'), data.get('especialidade'))
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
def get_veterinario(id):
    conn = get_db_connection()
    veterinario = conn.execute('SELECT * FROM veterinarios WHERE id = ?', (id,)).fetchone()
    conn.close()
    if veterinario is None:
        return jsonify({'error': 'Veterinário não encontrado'}), 404
    return jsonify(dict(veterinario))

@veterinarios_bp.route('/<int:id>', methods=['PUT'])
def update_veterinario(id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE veterinarios SET nome = ?, crmv = ?, telefone = ?, email = ?, especialidade = ? WHERE id = ?',
        (data['nome'], data.get('crmv'), data.get('telefone'), data.get('email'), data.get('especialidade'), id)
    )
    conn.commit()
    veterinario = conn.execute('SELECT * FROM veterinarios WHERE id = ?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(veterinario))

@veterinarios_bp.route('/<int:id>', methods=['DELETE'])
def delete_veterinario(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM veterinarios WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Veterinário excluído com sucesso'})