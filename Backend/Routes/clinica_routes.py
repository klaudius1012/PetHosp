from flask import Blueprint, request, jsonify
import sqlite3

clinica_bp = Blueprint('clinica_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@clinica_bp.route('', methods=['GET'])
def get_clinicas():
    """Retorna uma lista de todas as clínicas cadastradas."""
    conn = get_db_connection()
    try:
        clinicas = conn.execute('SELECT * FROM clinicas').fetchall()
        conn.close()
        return jsonify([dict(row) for row in clinicas]), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Erro ao buscar clínicas: {str(e)}'}), 500

@clinica_bp.route('/<int:id>', methods=['GET'])
def get_clinica(id):
    """Retorna os dados de uma clínica específica."""
    conn = get_db_connection()
    try:
        clinica = conn.execute('SELECT * FROM clinicas WHERE id = ?', (id,)).fetchone()
        conn.close()
        if not clinica:
            return jsonify({'error': 'Clínica não encontrada'}), 404
        return jsonify(dict(clinica)), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Erro ao buscar clínica: {str(e)}'}), 500

@clinica_bp.route('/<int:id>', methods=['PUT'])
def update_clinica(id):
    """Atualiza os dados de uma clínica existente."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400

    conn = get_db_connection()
    try:
        # Verifica se existe
        clinica = conn.execute('SELECT * FROM clinicas WHERE id = ?', (id,)).fetchone()
        if not clinica:
            conn.close()
            return jsonify({'error': 'Clínica não encontrada'}), 404

        campos = ['nome', 'cnpj', 'endereco', 'telefone']
        set_clause = []
        valores = []
        
        for campo in campos:
            if campo in data:
                set_clause.append(f"{campo} = ?")
                valores.append(data[campo])
        
        if not valores:
            conn.close()
            return jsonify({'message': 'Nada a atualizar'}), 200

        valores.append(id)
        sql = f"UPDATE clinicas SET {', '.join(set_clause)} WHERE id = ?"
        
        conn.execute(sql, valores)
        conn.commit()
        conn.close()
        return jsonify({'message': 'Clínica atualizada com sucesso!'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Erro ao atualizar clínica: {str(e)}'}), 500

@clinica_bp.route('/<int:id>', methods=['DELETE'])
def delete_clinica(id):
    """Exclui uma clínica existente."""
    conn = get_db_connection()
    try:
        clinica = conn.execute('SELECT * FROM clinicas WHERE id = ?', (id,)).fetchone()
        if not clinica:
            conn.close()
            return jsonify({'error': 'Clínica não encontrada'}), 404

        conn.execute('DELETE FROM clinicas WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Clínica excluída com sucesso!'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Erro ao excluir clínica: {str(e)}'}), 500

@clinica_bp.route('', methods=['POST'])
def create_clinica():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400

        nome = data.get('nome')
        cnpj = data.get('cnpj')
        endereco = data.get('endereco')
        telefone = data.get('telefone')

        if not nome:
            return jsonify({'error': 'O nome da clínica é obrigatório'}), 400

        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO clinicas (nome, cnpj, endereco, telefone) VALUES (?, ?, ?, ?)',
            (nome, cnpj, endereco, telefone)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'message': 'Clínica criada com sucesso!', 'id': new_id}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Erro ao criar clínica: {str(e)}'}), 500