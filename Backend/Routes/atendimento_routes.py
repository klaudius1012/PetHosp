from flask import Blueprint, request, jsonify
import sqlite3
from backend.config.database import get_connection
from flask_jwt_extended import jwt_required, get_jwt

atendimento_bp = Blueprint('atendimento_bp', __name__)

@atendimento_bp.route('/', methods=['GET'])
@jwt_required()
def listar_atendimentos():
    clinica_id = get_jwt().get('clinica_id')
    # Filtros da query string
    data_filtro = request.args.get('data')
    busca = request.args.get('q') # Busca por nome de tutor ou animal
    status = request.args.get('status')
    
    conn = get_connection()
    
    # Query base com JOIN para trazer nomes
    sql = '''
        SELECT a.*, t.nome as tutor_nome, an.nome as animal_nome, u.nome as veterinario_nome
        FROM atendimentos a
        LEFT JOIN tutores t ON a.tutor_id = t.id
        LEFT JOIN animais an ON a.animal_id = an.id
        LEFT JOIN usuarios u ON a.veterinario_id = u.id
        WHERE a.clinica_id = ?
    '''
    params = [clinica_id]
    
    if data_filtro:
        sql += ' AND date(a.data_hora) = ?'
        params.append(data_filtro)
        
    if status:
        sql += ' AND a.status = ?'
        params.append(status)
        
    if busca:
        termo = f'%{busca}%'
        sql += ' AND (t.nome LIKE ? OR an.nome LIKE ?)'
        params.extend([termo, termo])
    
    # Ordenação: Emergência primeiro, depois data/hora
    sql += ''' ORDER BY 
        CASE WHEN a.prioridade = 'Emergência' THEN 0 ELSE 1 END,
        a.data_hora ASC
    '''
    
    atendimentos = conn.execute(sql, params).fetchall()
    conn.close()
    
    return jsonify([dict(a) for a in atendimentos])

@atendimento_bp.route('/', methods=['POST'])
@jwt_required()
def criar_atendimento():
    clinica_id = get_jwt().get('clinica_id')
    user_id = get_jwt().get('sub')
    data = request.get_json()
    
    if not data.get('tutor_id') or not data.get('animal_id'):
        return jsonify({'error': 'Tutor e Animal são obrigatórios'}), 400

    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO atendimentos (
                tutor_id, animal_id, veterinario_id, data_hora, status, prioridade,
                peso, temperatura, frequencia_cardiaca, frequencia_respiratoria,
                tpc, mucosas, hidratacao, consciencia, queixa, observacoes,
                alergias, vacinacao, ambiente, alimentacao
            , clinica_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['tutor_id'], data['animal_id'], data.get('veterinario_id') or user_id,
            data.get('data_hora'), data.get('status', 'Aguardando'), data.get('prioridade', 'Normal'),
            data.get('peso'), data.get('temperatura'), data.get('frequencia_cardiaca'),
            data.get('frequencia_respiratoria'), data.get('tpc'), data.get('mucosas'),
            data.get('hidratacao'), data.get('consciencia'), data.get('queixa'),
            data.get('observacoes'), data.get('alergias'), data.get('vacinacao'),
            data.get('ambiente'), data.get('alimentacao'), clinica_id
        ))
        conn.commit()
        atendimento_id = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Atendimento criado', 'id': atendimento_id}), 201

@atendimento_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_atendimento(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_connection()
    # Busca dados completos incluindo nomes
    sql = '''
        SELECT a.*, t.nome as tutor_nome, an.nome as animal_nome, u.nome as veterinario_nome
        FROM atendimentos a
        LEFT JOIN tutores t ON a.tutor_id = t.id
        LEFT JOIN animais an ON a.animal_id = an.id
        LEFT JOIN usuarios u ON a.veterinario_id = u.id
        WHERE a.id = ? AND a.clinica_id = ?
    '''
    atendimento = conn.execute(sql, (id, clinica_id)).fetchone()
    conn.close()
    
    if not atendimento:
        return jsonify({'error': 'Atendimento não encontrado'}), 404
        
    return jsonify(dict(atendimento))

@atendimento_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_atendimento(id):
    clinica_id = get_jwt().get('clinica_id')
    data = request.get_json()
    conn = get_connection()
    
    # Lista de campos permitidos para atualização
    campos_permitidos = [
        'veterinario_id', 'status', 'prioridade', 'peso', 'temperatura',
        'frequencia_cardiaca', 'frequencia_respiratoria', 'tpc', 'mucosas',
        'hidratacao', 'consciencia', 'queixa', 'observacoes', 'alergias',
        'vacinacao', 'ambiente', 'alimentacao'
    ]
    
    set_clause = []
    valores = []
    
    for campo in campos_permitidos:
        if campo in data:
            set_clause.append(f"{campo} = ?")
            valores.append(data[campo])
            
    if not valores:
        conn.close()
        return jsonify({'message': 'Nada a atualizar'}), 200
        
    valores.append(id)
    valores.append(clinica_id)
    sql = f"UPDATE atendimentos SET {', '.join(set_clause)} WHERE id = ? AND clinica_id = ?"
    
    try:
        conn.execute(sql, valores)
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500
        
    conn.close()
    return jsonify({'message': 'Atendimento atualizado'})