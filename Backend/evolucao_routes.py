from flask import Blueprint, request, jsonify, session
import sqlite3

evolucao_bp = Blueprint('evolucao_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    return 'user_id' in session

@evolucao_bp.route('/', methods=['GET'])
def listar_evolucoes():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    atendimento_id = request.args.get('atendimento_id')
    if not atendimento_id:
        return jsonify({'error': 'Atendimento ID necessário'}), 400
    
    conn = get_db_connection()
    # Busca evoluções com nome do veterinário
    sql = '''
        SELECT e.*, u.nome as veterinario_nome 
        FROM evolucoes e
        LEFT JOIN usuarios u ON e.veterinario_id = u.id
        WHERE e.atendimento_id = ?
        ORDER BY e.data_hora DESC
    '''
    evolucoes = conn.execute(sql, (atendimento_id,)).fetchall()
    conn.close()
    
    return jsonify([dict(e) for e in evolucoes])

@evolucao_bp.route('/', methods=['POST'])
def criar_evolucao():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('atendimento_id') or not data.get('descricao'):
        return jsonify({'error': 'Descrição é obrigatória'}), 400

    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO evolucoes (atendimento_id, veterinario_id, descricao, tipo)
            VALUES (?, ?, ?, ?)
        ''', (
            data['atendimento_id'], 
            session.get('user_id'), 
            data['descricao'],
            data.get('tipo', 'Evolução')
        ))
        conn.commit()
        evolucao_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Evolução registrada', 'id': evolucao_id}), 201