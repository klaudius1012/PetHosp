from flask import Blueprint, request, jsonify, session
import sqlite3

classe_terapeutica_bp = Blueprint('classe_terapeutica_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    return 'user_id' in session

@classe_terapeutica_bp.route('/', methods=['GET'])
def listar_classes():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    conn = get_db_connection()
    classes = conn.execute('SELECT * FROM classes_terapeuticas ORDER BY nome').fetchall()
    conn.close()
    
    return jsonify([dict(c) for c in classes])

@classe_terapeutica_bp.route('/', methods=['POST'])
def criar_classe():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('nome'):
        return jsonify({'error': 'Nome da classe é obrigatório'}), 400

    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO classes_terapeuticas (nome, descricao) VALUES (?, ?)',
                     (data['nome'], data.get('descricao')))
        conn.commit()
        classe_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Classe terapêutica já existe'}), 400
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500
        
    conn.close()
    return jsonify({'message': 'Classe criada', 'id': classe_id}), 201

@classe_terapeutica_bp.route('/<int:id>', methods=['PUT'])
def atualizar_classe(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    
    campos = ['nome', 'descricao']
    set_clause = [f"{c} = ?" for c in campos if c in data]
    valores = [data[c] for c in campos if c in data]
    valores.append(id)
    
    if not set_clause:
        conn.close()
        return jsonify({'message': 'Nada a atualizar'}), 200
        
    try:
        conn.execute(f"UPDATE classes_terapeuticas SET {', '.join(set_clause)} WHERE id = ?", valores)
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Nome já em uso'}), 400
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500
        
    conn.close()
    return jsonify({'message': 'Classe atualizada'})

@classe_terapeutica_bp.route('/<int:id>', methods=['DELETE'])
def deletar_classe(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
        
    conn = get_db_connection()
    conn.execute('DELETE FROM classes_terapeuticas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Classe removida'})