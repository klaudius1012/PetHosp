from flask import Blueprint, jsonify, request
from backend.models import db, LancamentoFinanceiro
from datetime import datetime

financeiro_bp = Blueprint('financeiro_bp', __name__)

@financeiro_bp.route('/financeiro/', methods=['GET'])
def get_lancamentos():
    """Retorna lançamentos financeiros, com filtros de data, tipo e status."""
    query = LancamentoFinanceiro.query

    inicio = request.args.get('inicio')
    fim = request.args.get('fim')
    tipo = request.args.get('tipo')
    status = request.args.get('status')

    if inicio:
        query = query.filter(LancamentoFinanceiro.data_vencimento >= inicio)
    if fim:
        query = query.filter(LancamentoFinanceiro.data_vencimento <= fim)
    if tipo:
        query = query.filter(LancamentoFinanceiro.tipo == tipo)
    if status:
        query = query.filter(LancamentoFinanceiro.status == status)

    lancamentos = query.order_by(LancamentoFinanceiro.data_vencimento.desc()).all()
    return jsonify([l.to_dict() for l in lancamentos])


@financeiro_bp.route('/financeiro/<int:id>', methods=['GET'])
def get_lancamento_by_id(id):
    """Retorna um único lançamento financeiro pelo ID."""
    lancamento = LancamentoFinanceiro.query.get_or_404(id)
    return jsonify(lancamento.to_dict())


@financeiro_bp.route('/financeiro', methods=['POST'])
def create_lancamento():
    """Cria um novo lançamento financeiro."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dados não fornecidos"}), 400

    novo_lancamento = LancamentoFinanceiro(
        tipo=data.get('tipo'),
        descricao=data.get('descricao'),
        categoria=data.get('categoria'),
        valor=float(data.get('valor')),
        data_vencimento=datetime.strptime(data.get('data_vencimento'), '%Y-%m-%d').date(),
        status=data.get('status')
    )
    db.session.add(novo_lancamento)
    db.session.commit()
    return jsonify(novo_lancamento.to_dict()), 201


@financeiro_bp.route('/financeiro/<int:id>', methods=['PUT'])
def update_lancamento(id):
    """Atualiza um lançamento financeiro existente."""
    lancamento = LancamentoFinanceiro.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dados não fornecidos"}), 400

    lancamento.tipo = data.get('tipo', lancamento.tipo)
    lancamento.descricao = data.get('descricao', lancamento.descricao)
    lancamento.categoria = data.get('categoria', lancamento.categoria)
    lancamento.valor = float(data.get('valor', lancamento.valor))
    lancamento.data_vencimento = datetime.strptime(data.get('data_vencimento'), '%Y-%m-%d').date()
    lancamento.status = data.get('status', lancamento.status)

    db.session.commit()
    return jsonify(lancamento.to_dict())


@financeiro_bp.route('/financeiro/<int:id>', methods=['DELETE'])
def delete_lancamento(id):
    """Exclui um lançamento financeiro."""
    lancamento = LancamentoFinanceiro.query.get_or_404(id)
    db.session.delete(lancamento)
    db.session.commit()
    return jsonify({'message': 'Lançamento excluído com sucesso'}), 200