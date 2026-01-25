from flask import Blueprint, request, jsonify, session
import sqlite3
from datetime import datetime

financeiro_bp = Blueprint('financeiro_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    return 'user_id' in session

@financeiro_bp.route('/', methods=['GET'])
def listar_lancamentos():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data_inicio = request.args.get('inicio')
    data_fim = request.args.get('fim')
    tipo = request.args.get('tipo')
    status = request.args.get('status')
    
    conn = get_db_connection()
    sql = '''
        SELECT f.*, t.nome as tutor_nome 
        FROM financeiro f
        LEFT JOIN tutores t ON f.tutor_id = t.id
        WHERE 1=1
    '''
    params = []
    
    if data_inicio and data_fim:
        sql += ' AND date(f.data_vencimento) BETWEEN ? AND ?'
        params.extend([data_inicio, data_fim])
        
    if tipo:
        sql += ' AND f.tipo = ?'
        params.append(tipo)
        
    if status:
        sql += ' AND f.status = ?'
        params.append(status)
        
    sql += ' ORDER BY f.data_vencimento DESC'
    
    lancamentos = conn.execute(sql, params).fetchall()
    conn.close()
    
    return jsonify([dict(l) for l in lancamentos])

@financeiro_bp.route('/', methods=['POST'])
def criar_lancamento():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('descricao') or not data.get('valor') or not data.get('tipo'):
        return jsonify({'error': 'Campos obrigatórios: descricao, valor, tipo'}), 400

    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO financeiro (
                tipo, categoria, descricao, valor, data_vencimento, 
                data_pagamento, status, metodo_pagamento, tutor_id, 
                atendimento_id, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['tipo'], data.get('categoria'), data['descricao'], data['valor'],
            data.get('data_vencimento'), data.get('data_pagamento'), 
            data.get('status', 'Pendente'), data.get('metodo_pagamento'),
            data.get('tutor_id'), data.get('atendimento_id'), data.get('observacoes')
        ))
        conn.commit()
        lanc_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Lançamento criado', 'id': lanc_id}), 201

@financeiro_bp.route('/<int:id>', methods=['PUT'])
def atualizar_lancamento(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    
    campos = ['tipo', 'categoria', 'descricao', 'valor', 'data_vencimento', 
              'data_pagamento', 'status', 'metodo_pagamento', 'observacoes']
    
    set_clause = [f"{c} = ?" for c in campos if c in data]
    valores = [data[c] for c in campos if c in data]
    
    if not valores:
        conn.close()
        return jsonify({'message': 'Nada a atualizar'}), 200

    valores.append(id)
    
    try:
        conn.execute(f"UPDATE financeiro SET {', '.join(set_clause)} WHERE id = ?", valores)
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500
        
    conn.close()
    return jsonify({'message': 'Lançamento atualizado'})

@financeiro_bp.route('/<int:id>', methods=['DELETE'])
def deletar_lancamento(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
        
    conn = get_db_connection()
    conn.execute('DELETE FROM financeiro WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Lançamento excluído'})