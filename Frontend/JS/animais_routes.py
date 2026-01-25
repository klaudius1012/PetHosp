from flask import Blueprint, jsonify, request
from backend.models import db, Animal, Tutor
from sqlalchemy import or_

animais_bp = Blueprint('animais_bp', __name__)

@animais_bp.route('/animais', methods=['GET'])
def get_animais():
    """
    Retorna uma lista de animais.
    Aceita um parâmetro de query 'q' para busca.
    """
    query = Animal.query.join(Tutor)
    search_term = request.args.get('q')

    if search_term:
        like_term = f"%{search_term}%"
        query = query.filter(
            or_(
                Animal.nome.ilike(like_term),
                Animal.especie.ilike(like_term),
                Tutor.nome.ilike(like_term)
            )
        )
    
    # Ordena por nome do animal
    query = query.order_by(Animal.nome.asc())
    
    animais = query.all()
    return jsonify([animal.to_dict() for animal in animais])

@animais_bp.route('/animais/<int:id>', methods=['DELETE'])
def delete_animal(id):
    """Exclui um animal pelo ID."""
    animal = Animal.query.get_or_404(id)
    
    db.session.delete(animal)
    db.session.commit()
    return jsonify({'message': 'Animal excluído com sucesso'}), 200

# Adicionar aqui as rotas GET /animais/<id> e PUT /animais/<id> quando for implementar a edição