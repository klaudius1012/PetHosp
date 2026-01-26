from flask import Blueprint, request, jsonify
import sqlite3
from flask_jwt_extended import jwt_required, get_jwt

clinica_bp = Blueprint('clinica_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_clinica_id_from_token():
    """
    Função auxiliar para obter o 'clinica_id' do token JWT.
    Este ID será usado para filtrar todas as operações do banco de dados.
    """
    claims = get_jwt()
    clinica_id = claims.get('clinica_id')
    if not clinica_id:
        # Aborta a requisição se o ID da clínica não estiver no token.
        from flask import abort
        abort(401, description="ID da clínica ausente no token de autenticação.")
    return clinica_id

@clinica_bp.route('', methods=['GET'])
@jwt_required()
def get_clinicas():
    """
    Retorna uma lista de clínicas.
    
    PADRÃO MULTI-CLÍNICA: Em outras rotas (ex: /tutores, /animais), 
    esta função seria usada para listar APENAS os itens da clínica do usuário.
    O SQL seria: 'SELECT * FROM tutores WHERE id_clinica = ?'
    """
    conn = get_db_connection()
    try:
        # Exemplo de como obter o ID da clínica do usuário logado
        clinica_id = get_clinica_id_from_token()

        # Para esta rota específica, listamos todas as clínicas, pois é uma
        # entidade de gerenciamento. Para outras rotas, você filtraria pelo clinica_id.
        # Exemplo de como seria em outra rota:
        # tutores = conn.execute('SELECT * FROM tutores WHERE id_clinica = ?', (clinica_id,)).fetchall()
        
        clinicas = conn.execute('SELECT * FROM clinicas').fetchall()
        return jsonify([dict(row) for row in clinicas]), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar clínicas: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()

@clinica_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_clinica(id):
    """Retorna os dados de uma clínica específica."""
    conn = get_db_connection()
    try:
        clinica = conn.execute('SELECT * FROM clinicas WHERE id = ?', (id,)).fetchone()
        if not clinica:
            return jsonify({'error': 'Clínica não encontrada'}), 404
        return jsonify(dict(clinica)), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar clínica: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()

@clinica_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_clinica(id):
    """Atualiza os dados de uma clínica existente."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400

    conn = None
    try:
        conn = get_db_connection()
        # Verifica se existe
        clinica = conn.execute('SELECT * FROM clinicas WHERE id = ?', (id,)).fetchone()
        if not clinica:
            return jsonify({'error': 'Clínica não encontrada'}), 404

        campos = ['nome', 'cnpj', 'endereco', 'telefone']
        set_clause = []
        valores = []

        for campo in campos:
            if campo in data:
                set_clause.append(f"{campo} = ?")
                valores.append(data[campo])

        if not valores:
            return jsonify({'message': 'Nada a atualizar'}), 200

        valores.append(id)
        sql = f"UPDATE clinicas SET {', '.join(set_clause)} WHERE id = ?"

        conn.execute(sql, valores)
        conn.commit()
        return jsonify({'message': 'Clínica atualizada com sucesso!'}), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao atualizar clínica: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()

@clinica_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_clinica(id):
    """Exclui uma clínica existente."""
    conn = None
    try:
        conn = get_db_connection()
        clinica = conn.execute('SELECT * FROM clinicas WHERE id = ?', (id,)).fetchone()
        if not clinica:
            return jsonify({'error': 'Clínica não encontrada'}), 404

        conn.execute('DELETE FROM clinicas WHERE id = ?', (id,))
        conn.commit()
        return jsonify({'message': 'Clínica excluída com sucesso!'}), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao excluir clínica: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()

@clinica_bp.route('', methods=['POST'])
@jwt_required()
def create_clinica():
    """
    Cria uma nova clínica.
    
    PADRÃO MULTI-CLÍNICA: Esta rota é um exemplo de como usar o 'clinica_id'
    ao criar um novo item (tutor, animal, etc.).
    """
    conn = None
    try:
        # 1. Obter o ID da clínica do usuário logado.
        # Este passo é essencial para todas as rotas de criação de dados.
        clinica_id_usuario = get_clinica_id_from_token()

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        nome = data.get('nome')
        cnpj = data.get('cnpj')
        endereco = data.get('endereco')
        telefone = data.get('telefone')
        
        if not nome:
            return jsonify({'error': 'O nome da clínica é obrigatório'}), 400

        # 2. Adicionar o `id_clinica` no INSERT.
        # O exemplo abaixo é para a tabela 'tutores'. Adapte para outras tabelas.
        # sql_tutor = 'INSERT INTO tutores (nome, cpf, id_clinica) VALUES (?, ?, ?)'
        # valores_tutor = (nome_tutor, cpf_tutor, clinica_id_usuario)

        # Como esta rota cria a própria clínica, não inserimos o `clinica_id_usuario`.
        # Apenas demonstramos o padrão.
        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO clinicas (nome, cnpj, endereco, telefone) VALUES (?, ?, ?, ?)',
            (nome, cnpj, endereco, telefone)
        )
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({'message': 'Clínica criada com sucesso!', 'id': new_id}), 201
    except Exception as e:
        return jsonify({'error': f'Erro ao criar clínica: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()