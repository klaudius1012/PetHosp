from flask import Blueprint, request, jsonify
import sqlite3
import json
from datetime import datetime

prescricao_bp = Blueprint('prescricao_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@prescricao_bp.route('/prescricoes', methods=['GET'])
def get_prescricoes():
    atendimento_id = request.args.get('atendimento_id')
    conn = get_db_connection()
    
    if atendimento_id:
        rows = conn.execute('SELECT * FROM prescricoes WHERE atendimento_id = ?', (atendimento_id,)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM prescricoes').fetchall()
    
    conn.close()
    
    prescricoes = []
    for row in rows:
        p = dict(row)
        p['medicamentos'] = json.loads(p['medicamentos']) if p['medicamentos'] else []
        prescricoes.append(p)
        
    return jsonify(prescricoes)

@prescricao_bp.route('/prescricoes', methods=['POST'])
def create_prescricao():
    data = request.json
    conn = get_db_connection()
    
    medicamentos_json = json.dumps(data.get('medicamentos', []))
    data_atual = datetime.now().isoformat()
    
    cursor = conn.execute(
        'INSERT INTO prescricoes (atendimento_id, data, observacoes, medicamentos) VALUES (?, ?, ?, ?)',
        (data['atendimento_id'], data_atual, data.get('observacoes', ''), medicamentos_json)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': new_id, 'message': 'Prescrição salva com sucesso'}), 201

@prescricao_bp.route('/prescricoes/<int:id>', methods=['GET'])
def get_prescricao(id):
    conn = get_db_connection()
    row = conn.execute('SELECT * FROM prescricoes WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if row:
        p = dict(row)
        p['medicamentos'] = json.loads(p['medicamentos']) if p['medicamentos'] else []
        return jsonify(p)
    return jsonify({'error': 'Prescrição não encontrada'}), 404

# --- Rotas de Kits / Modelos ---

@prescricao_bp.route('/prescricoes/kits', methods=['GET'])
def get_kits():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM kits_prescricao').fetchall()
    conn.close()
    
    kits = []
    for row in rows:
        k = dict(row)
        k['medicamentos'] = json.loads(k['medicamentos']) if k['medicamentos'] else []
        kits.append(k)
    return jsonify(kits)

@prescricao_bp.route('/prescricoes/kits', methods=['POST'])
def create_kit():
    data = request.json
    conn = get_db_connection()
    medicamentos_json = json.dumps(data.get('medicamentos', []))
    conn.execute('INSERT INTO kits_prescricao (nome, medicamentos) VALUES (?, ?)', (data['nome'], medicamentos_json))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Kit salvo com sucesso'}), 201

@prescricao_bp.route('/prescricoes/kits/<int:id>', methods=['DELETE'])
def delete_kit(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM kits_prescricao WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Kit excluído'})