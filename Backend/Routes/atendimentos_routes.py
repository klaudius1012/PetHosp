from flask import Blueprint, request, jsonify
import sqlite3

atendimentos_bp = Blueprint('atendimentos_bp', __name__)

def get_db_connection():
    # Ajuste o caminho conforme a estrutura do seu ambiente, 
    # mantendo consistência com prescricao_routes.py
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

# --- Rota de Atualização Completa de Atendimento ---

@atendimentos_bp.route('/atendimentos/<int:id>', methods=['PUT'])
def update_atendimento(id):
    data = request.json
    conn = get_db_connection()
    
    # Mapeamento de campos JSON para colunas do BD
    # Assume-se que o frontend envia camelCase e o BD usa snake_case ou similar
    campos = [
        ('peso', data.get('peso')),
        ('temperatura', data.get('temperatura')),
        ('frequencia_cardiaca', data.get('frequenciaCardiaca') or data.get('frequencia_cardiaca')),
        ('frequencia_respiratoria', data.get('frequenciaRespiratoria') or data.get('frequencia_respiratoria')),
        ('tpc', data.get('tpc')),
        ('mucosas', data.get('mucosas')),
        ('hidratacao', data.get('hidratacao')),
        ('consciencia', data.get('consciencia')),
        ('queixa', data.get('queixa')),
        ('observacoes', data.get('observacoes')),
        ('status', data.get('status')),
        ('prioridade', data.get('prioridade')),
        ('alergias', data.get('alergias'))
    ]
    
    # Filtra apenas os campos que foram enviados
    campos_para_atualizar = [(col, val) for col, val in campos if val is not None]
    
    if not campos_para_atualizar:
        conn.close()
        return jsonify({'message': 'Nenhum dado para atualizar'}), 200

    set_clause = ', '.join([f"{col} = ?" for col, val in campos_para_atualizar])
    values = [val for col, val in campos_para_atualizar]
    values.append(id)
    
    try:
        conn.execute(f'UPDATE atendimentos SET {set_clause} WHERE id = ?', values)
        conn.commit()
        
        # Retorna o atendimento atualizado
        atendimento = conn.execute('SELECT * FROM atendimentos WHERE id = ?', (id,)).fetchone()
        conn.close()
        
        if atendimento:
            return jsonify(dict(atendimento))
        else:
            return jsonify({'error': 'Atendimento não encontrado'}), 404
            
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

# --- Rotas para Dados Associados (Impressão de Histórico) ---

@atendimentos_bp.route('/evolucoes', methods=['GET'])
def get_evolucoes():
    atendimento_id = request.args.get('atendimento_id')
    if not atendimento_id:
        return jsonify([]), 400
        
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM evolucoes WHERE atendimento_id = ? ORDER BY data_hora DESC', (atendimento_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@atendimentos_bp.route('/exames', methods=['GET'])
def get_exames():
    atendimento_id = request.args.get('atendimento_id')
    if not atendimento_id:
        return jsonify([]), 400
        
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM exames WHERE atendimento_id = ? ORDER BY id DESC', (atendimento_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@atendimentos_bp.route('/procedimentos', methods=['GET'])
def get_procedimentos():
    atendimento_id = request.args.get('atendimento_id')
    if not atendimento_id:
        return jsonify([]), 400
        
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM procedimentos WHERE atendimento_id = ? ORDER BY id DESC', (atendimento_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@atendimentos_bp.route('/afericoes', methods=['GET'])
def get_afericoes():
    atendimento_id = request.args.get('atendimento_id')
    if not atendimento_id:
        return jsonify([]), 400
        
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM afericoes WHERE atendimento_id = ? ORDER BY data_hora DESC', (atendimento_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])