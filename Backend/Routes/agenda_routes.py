from flask import Blueprint, request, jsonify, session
import sqlite3

agenda_bp = Blueprint('agenda_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    return 'user_id' in session

@agenda_bp.route('/', methods=['GET'])
def listar_agendamentos():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    # Filtros opcionais
    data_filtro = request.args.get('data') # YYYY-MM-DD
    busca = request.args.get('q')
    
    conn = get_db_connection()
    sql = 'SELECT * FROM agendamentos WHERE 1=1'
    params = []
    
    if data_filtro:
        sql += ' AND data = ?'
        params.append(data_filtro)
        
    if busca:
        termo = f'%{busca}%'
        sql += ' AND (tutor LIKE ? OR animal LIKE ?)'
        params.extend([termo, termo])
        
    sql += ' ORDER BY data ASC, hora ASC'
    
    agendamentos = conn.execute(sql, params).fetchall()
    conn.close()
    
    return jsonify([dict(a) for a in agendamentos])

@agenda_bp.route('/', methods=['POST'])
def criar_agendamento():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('hora') or not data.get('tutor') or not data.get('animal'):
        return jsonify({'error': 'Campos obrigatórios: hora, tutor, animal'}), 400

    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO agendamentos (hora, tutor, telefone, animal, especie, veterinario, tipo, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_DATE))
        ''', (
            data['hora'], data['tutor'], data.get('telefone'),
            data['animal'], data.get('especie'), data.get('veterinario'),
            data.get('tipo'), data.get('data')
        ))
        conn.commit()
        ag_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Agendamento criado', 'id': ag_id}), 201

@agenda_bp.route('/<int:id>', methods=['PUT'])
def atualizar_agendamento(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    
    campos = ['hora', 'tutor', 'telefone', 'animal', 'especie', 'veterinario', 'tipo', 'data', 'status']
    set_clause = [f"{c} = ?" for c in campos if c in data]
    valores = [data[c] for c in campos if c in data]
    valores.append(id)
    
    if valores:
        conn.execute(f"UPDATE agendamentos SET {', '.join(set_clause)} WHERE id = ?", valores)
        conn.commit()
    
    conn.close()
    return jsonify({'message': 'Agendamento atualizado'})

@agenda_bp.route('/<int:id>', methods=['DELETE'])
def deletar_agendamento(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
        
    conn = get_db_connection()
    conn.execute('DELETE FROM agendamentos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Agendamento excluído'})