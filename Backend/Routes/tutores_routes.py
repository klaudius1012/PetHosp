from flask import Blueprint, request, jsonify
from backend.models import db, Tutor

tutores_bp = Blueprint('tutores_bp', __name__)

@tutores_bp.route('/tutores', methods=['GET'])
def get_tutores():
    tutores = Tutor.query.all()
    return jsonify([t.to_dict() for t in tutores])

@tutores_bp.route('/tutores', methods=['POST'])
def create_tutor():
    data = request.json
    novo_tutor = Tutor(
        nome=data.get('nome'),
        cpf=data.get('cpf'),
        telefone=data.get('telefone'),
        email=data.get('email'),
        endereco=data.get('endereco')
    )
    db.session.add(novo_tutor)
    db.session.commit()
    return jsonify(novo_tutor.to_dict()), 201

@tutores_bp.route('/tutores/<int:id>', methods=['GET'])
def get_tutor(id):
    tutor = Tutor.query.get_or_404(id)
    return jsonify(tutor.to_dict())

@tutores_bp.route('/tutores/<int:id>', methods=['PUT'])
def update_tutor(id):
    tutor = Tutor.query.get_or_404(id)
    data = request.json
    
    tutor.nome = data.get('nome', tutor.nome)
    tutor.cpf = data.get('cpf', tutor.cpf)
    tutor.telefone = data.get('telefone', tutor.telefone)
    tutor.email = data.get('email', tutor.email)
    tutor.endereco = data.get('endereco', tutor.endereco)
    
    db.session.commit()
    return jsonify(tutor.to_dict())

@tutores_bp.route('/tutores/<int:id>', methods=['DELETE'])
def delete_tutor(id):
    tutor = Tutor.query.get_or_404(id)
    db.session.delete(tutor)
    db.session.commit()
    return jsonify({'message': 'Tutor excluído com sucesso'})