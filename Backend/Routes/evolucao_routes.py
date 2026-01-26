from flask import Blueprint, request, jsonify
import sqlite3
from flask_jwt_extended import jwt_required, get_jwt

evolucao_bp = Blueprint('evolucao_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@evolucao_bp.route('/', methods=['GET'])
@jwt_required()
def listar_evolucoes():
    clinica_id = get_jwt().get('clinica_id')
    atendimento_id = request.args.get('atendimento_id')
    if not atendimento_id:
        return jsonify({'error': 'Atendimento ID necessário'}), 400
    
    conn = get_db_connection()
    # Busca evoluções com nome do veterinário
    sql = '''
        SELECT e.*, u.nome as veterinario_nome 
        FROM evolucoes e
        LEFT JOIN usuarios u ON e.veterinario_id = u.id
        WHERE e.atendimento_id = ? AND e.clinica_id = ?
        ORDER BY e.data_hora DESC
    '''
    evolucoes = conn.execute(sql, (atendimento_id, clinica_id)).fetchall()
    conn.close()
    
    return jsonify([dict(e) for e in evolucoes])

@evolucao_bp.route('/', methods=['POST'])
@jwt_required()
def criar_evolucao():
    clinica_id = get_jwt().get('clinica_id')
    user_id = get_jwt().get('sub') # 'sub' is the identity (user id)
    data = request.get_json()
    
    if not data.get('atendimento_id') or not data.get('descricao'):
        return jsonify({'error': 'Descrição é obrigatória'}), 400

    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO evolucoes (atendimento_id, veterinario_id, descricao, tipo, clinica_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['atendimento_id'], 
            user_id, 
            data['descricao'],
            data.get('tipo', 'Evolução'),
            clinica_id
        ))
        conn.commit()
        evolucao_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Evolução registrada', 'id': evolucao_id}), 201