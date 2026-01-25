from flask import Blueprint, request, jsonify, session
import sqlite3
import json

prescricao_bp = Blueprint('prescricao_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    return 'user_id' in session

# --- Rotas de Prescrições ---

@prescricao_bp.route('/', methods=['GET'])
def listar_prescricoes():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    atendimento_id = request.args.get('atendimento_id')
    
    conn = get_db_connection()
    sql = '''
        SELECT p.*, u.nome as veterinario_nome 
        FROM prescricoes p
        LEFT JOIN usuarios u ON p.veterinario_id = u.id
        WHERE 1=1
    '''
    params = []
    
    if atendimento_id:
        sql += ' AND p.atendimento_id = ?'
        params.append(atendimento_id)
        
    sql += ' ORDER BY p.data DESC'
    
    prescricoes = conn.execute(sql, params).fetchall()
    conn.close()
    
    lista = []
    for p in prescricoes:
        item = dict(p)
        # Converte string JSON de volta para lista Python
        if item['medicamentos']:
            try:
                item['medicamentos'] = json.loads(item['medicamentos'])
            except:
                item['medicamentos'] = []
        lista.append(item)
        
    return jsonify(lista)

@prescricao_bp.route('/<int:id>', methods=['GET'])
def obter_prescricao(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
        
    conn = get_db_connection()
    prescricao = conn.execute('SELECT * FROM prescricoes WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if not prescricao:
        return jsonify({'error': 'Prescrição não encontrada'}), 404
        
    item = dict(prescricao)
    if item['medicamentos']:
        item['medicamentos'] = json.loads(item['medicamentos'])
        
    return jsonify(item)

@prescricao_bp.route('/', methods=['POST'])
def criar_prescricao():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('atendimento_id') or not data.get('medicamentos'):
        return jsonify({'error': 'Atendimento e Medicamentos são obrigatórios'}), 400

    medicamentos_json = json.dumps(data['medicamentos'])
    veterinario_id = session.get('user_id')

    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO prescricoes (atendimento_id, veterinario_id, observacoes, medicamentos)
            VALUES (?, ?, ?, ?)
        ''', (data['atendimento_id'], veterinario_id, data.get('observacoes'), medicamentos_json))
        conn.commit()
        prescricao_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500
        
    conn.close()
    return jsonify({'message': 'Prescrição salva', 'id': prescricao_id}), 201

# --- Rotas de Kits (Modelos) ---

@prescricao_bp.route('/kits', methods=['GET'])
def listar_kits():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
        
    conn = get_db_connection()
    # Lista kits globais ou do próprio veterinário
    kits = conn.execute('''
        SELECT * FROM prescricao_kits 
        WHERE veterinario_id IS NULL OR veterinario_id = ?
        ORDER BY nome
    ''', (session.get('user_id'),)).fetchall()
    conn.close()
    
    lista = []
    for k in kits:
        item = dict(k)
        if item['medicamentos']:
            try:
                item['medicamentos'] = json.loads(item['medicamentos'])
            except:
                item['medicamentos'] = []
        lista.append(item)
        
    return jsonify(lista)

@prescricao_bp.route('/kits', methods=['POST'])
def criar_kit():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('nome') or not data.get('medicamentos'):
        return jsonify({'error': 'Nome e Medicamentos são obrigatórios'}), 400
        
    medicamentos_json = json.dumps(data['medicamentos'])
    veterinario_id = session.get('user_id')
    
    conn = get_db_connection()
    conn.execute('INSERT INTO prescricao_kits (nome, medicamentos, veterinario_id) VALUES (?, ?, ?)',
                 (data['nome'], medicamentos_json, veterinario_id))
    conn.commit()
    kit_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    conn.close()
    
    return jsonify({'message': 'Kit salvo', 'id': kit_id}), 201

@prescricao_bp.route('/kits/<int:id>', methods=['DELETE'])
def deletar_kit(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
        
    conn = get_db_connection()
    # Só permite deletar se for dono do kit
    kit = conn.execute('SELECT veterinario_id FROM prescricao_kits WHERE id = ?', (id,)).fetchone()
    
    if not kit:
        conn.close()
        return jsonify({'error': 'Kit não encontrado'}), 404
        
    if kit['veterinario_id'] != session.get('user_id'):
        conn.close()
        return jsonify({'error': 'Permissão negada'}), 403
        
    conn.execute('DELETE FROM prescricao_kits WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Kit removido'})