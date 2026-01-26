from flask import Blueprint, request, jsonify
import sqlite3
from flask_jwt_extended import jwt_required, get_jwt

animal_bp = Blueprint('animal_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

@animal_bp.route('/', methods=['GET'])
@jwt_required()
def listar_animais():
    clinica_id = get_jwt().get('clinica_id')
    tutor_id = request.args.get('tutor_id')
    conn = get_db_connection()
    
    if tutor_id:
        animais = conn.execute('''
            SELECT a.*, t.nome as tutor_nome 
            FROM animais a 
            LEFT JOIN tutores t ON a.tutor_id = t.id 
            WHERE a.tutor_id = ? AND a.clinica_id = ?
        ''', (tutor_id, clinica_id)).fetchall()
    else:
        animais = conn.execute('''
            SELECT a.*, t.nome as tutor_nome 
            FROM animais a 
            LEFT JOIN tutores t ON a.tutor_id = t.id
            WHERE a.clinica_id = ?
        ''', (clinica_id,)).fetchall()
    
    conn.close()
    return jsonify([dict(a) for a in animais])

@animal_bp.route('/', methods=['POST'])
@jwt_required()
def criar_animal():
    clinica_id = get_jwt().get('clinica_id')
    
    data = request.get_json()
    
    # Validação básica
    if not data.get('tutor_id') or not data.get('nome') or not data.get('especie'):
        return jsonify({'error': 'Campos obrigatórios: tutor_id, nome, especie'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO animais (
                tutor_id, nome, especie, raca, sexo, nascimento, peso, 
                porte, condicao_reprodutiva, alergias, vacinacao,
                ambiente, alimentacao, observacoes, foto
            , clinica_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['tutor_id'], data['nome'], data['especie'], data.get('raca'), 
            data.get('sexo'), data.get('nascimento'), data.get('peso'),
            data.get('porte'), data.get('condicao_reprodutiva'), data.get('alergias'),
            data.get('vacinacao'), data.get('ambiente'), data.get('alimentacao'),
            data.get('observacoes'), data.get('foto'), clinica_id
        ))
        conn.commit()
        animal_id = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Animal cadastrado com sucesso', 'id': animal_id}), 201

@animal_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_animal(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    animal = conn.execute('SELECT * FROM animais WHERE id = ? AND clinica_id = ?', (id, clinica_id)).fetchone()
    conn.close()
    
    if animal is None:
        return jsonify({'error': 'Animal não encontrado'}), 404
        
    return jsonify(dict(animal))

@animal_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_animal(id):
    clinica_id = get_jwt().get('clinica_id')
    
    data = request.get_json()
    conn = get_db_connection()
    
    campos = [
        'nome', 'especie', 'raca', 'sexo', 'nascimento', 'peso', 
        'porte', 'condicao_reprodutiva', 'alergias', 'vacinacao', 'tutor_id',
        'ambiente', 'alimentacao', 'observacoes', 'foto'
    ]
    
    set_clause = []
    valores = []
    for campo in campos:
        if campo in data:
            set_clause.append(f"{campo} = ?")
            valores.append(data[campo])
            
    if not valores:
        conn.close()
        return jsonify({'message': 'Nada a atualizar'}), 200
        
    valores.append(id)
    valores.append(clinica_id)
    sql = f"UPDATE animais SET {', '.join(set_clause)} WHERE id = ? AND clinica_id = ?"
    
    conn.execute(sql, valores)
    conn.commit()
    conn.close()
        
    return jsonify({'message': 'Animal atualizado com sucesso'})

@animal_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def deletar_animal(id):
    clinica_id = get_jwt().get('clinica_id')
    conn = get_db_connection()
    conn.execute('DELETE FROM animais WHERE id = ? AND clinica_id = ?', (id, clinica_id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Animal excluído com sucesso'})