from flask import Blueprint, request, jsonify
from backend.models import db, Animal

animais_bp = Blueprint('animais_bp', __name__)

@animais_bp.route('/animais', methods=['GET'])
def get_animais():
    tutor_id = request.args.get('tutor_id')
    q = request.args.get('q')
    
    query = Animal.query
    
    if tutor_id:
        query = query.filter_by(tutor_id=tutor_id)
        
    if q:
        query = query.filter(Animal.nome.ilike(f'%{q}%'))
        
    animais = query.all()
    return jsonify([a.to_dict() for a in animais])

@animais_bp.route('/animais', methods=['POST'])
def create_animal():
    data = request.json
    novo_animal = Animal(
        nome=data.get('nome'),
        especie=data.get('especie'),
        raca=data.get('raca'),
        nascimento=data.get('nascimento'),
        peso=data.get('peso'),
        alergias=data.get('alergias'),
        vacinacao=data.get('vacinacao'),
        tutor_id=data.get('tutor_id')
    )
    db.session.add(novo_animal)
    db.session.commit()
    return jsonify(novo_animal.to_dict()), 201

@animais_bp.route('/animais/<int:id>', methods=['GET'])
def get_animal(id):
    animal = Animal.query.get_or_404(id)
    return jsonify(animal.to_dict())

@animais_bp.route('/animais/<int:id>', methods=['PUT'])
def update_animal(id):
    animal = Animal.query.get_or_404(id)
    data = request.json
    
    animal.nome = data.get('nome', animal.nome)
    animal.especie = data.get('especie', animal.especie)
    animal.raca = data.get('raca', animal.raca)
    animal.nascimento = data.get('nascimento', animal.nascimento)
    animal.peso = data.get('peso', animal.peso)
    animal.alergias = data.get('alergias', animal.alergias)
    animal.vacinacao = data.get('vacinacao', animal.vacinacao)
    
    if 'tutor_id' in data:
        animal.tutor_id = data['tutor_id']
        
    db.session.commit()
    return jsonify(animal.to_dict())

@animais_bp.route('/animais/<int:id>', methods=['DELETE'])
def delete_animal(id):
    animal = Animal.query.get_or_404(id)
    db.session.delete(animal)
    db.session.commit()
    return jsonify({'message': 'Animal excluído com sucesso'})