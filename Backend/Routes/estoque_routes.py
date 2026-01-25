from flask import Blueprint, request, jsonify, session
import sqlite3
from datetime import datetime

estoque_bp = Blueprint('estoque_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    return 'user_id' in session

@estoque_bp.route('/', methods=['GET'])
def listar_produtos():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    busca = request.args.get('q')
    categoria = request.args.get('categoria')
    baixo_estoque = request.args.get('baixo_estoque')
    
    conn = get_db_connection()
    sql = 'SELECT * FROM produtos WHERE 1=1'
    params = []
    
    if busca:
        termo = f'%{busca}%'
        sql += ' AND (nome LIKE ? OR principio_ativo LIKE ?)'
        params.extend([termo, termo])
        
    if categoria:
        sql += ' AND categoria = ?'
        params.append(categoria)
        
    if baixo_estoque == 'true':
        sql += ' AND estoque_atual <= estoque_minimo'
    
    sql += ' ORDER BY nome ASC'
    
    produtos = conn.execute(sql, params).fetchall()
    conn.close()
    
    lista = []
    hoje = datetime.now().date()
    
    for p in produtos:
        item = dict(p)
        # Lógica simples de status
        item['status_estoque'] = 'OK'
        if item['estoque_atual'] <= item['estoque_minimo']:
            item['status_estoque'] = 'BAIXO'
            
        # Verifica validade se existir
        if item['validade']:
            val = datetime.strptime(item['validade'], '%Y-%m-%d').date()
            if val < hoje:
                item['status_validade'] = 'VENCIDO'
            elif (val - hoje).days < 30:
                item['status_validade'] = 'A VENCER'
            else:
                item['status_validade'] = 'OK'
        
        lista.append(item)
        
    return jsonify(lista)

@estoque_bp.route('/', methods=['POST'])
def criar_produto():
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    
    if not data.get('nome'):
        return jsonify({'error': 'Nome do produto é obrigatório'}), 400

    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO produtos (
                nome, categoria, classe_terapeutica, principio_ativo, concentracao,
                unidade_medida, apresentacao, lote, validade, estoque_atual,
                estoque_minimo, valor_custo, valor_venda, fornecedor, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['nome'], data.get('categoria'), data.get('classe_terapeutica'),
            data.get('principio_ativo'), data.get('concentracao'), data.get('unidade_medida'),
            data.get('apresentacao'), data.get('lote'), data.get('validade'),
            data.get('estoque_atual', 0), data.get('estoque_minimo', 5),
            data.get('valor_custo'), data.get('valor_venda'),
            data.get('fornecedor'), data.get('observacoes')
        ))
        conn.commit()
        prod_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Produto cadastrado', 'id': prod_id}), 201

@estoque_bp.route('/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    
    campos = ['nome', 'categoria', 'classe_terapeutica', 'principio_ativo', 'concentracao',
              'unidade_medida', 'apresentacao', 'lote', 'validade', 'estoque_atual',
              'estoque_minimo', 'valor_custo', 'valor_venda', 'fornecedor', 'observacoes']
    
    set_clause = [f"{c} = ?" for c in campos if c in data]
    valores = [data[c] for c in campos if c in data]
    valores.append(id)
    
    conn.execute(f"UPDATE produtos SET {', '.join(set_clause)} WHERE id = ?", valores)
    conn.commit()
    conn.close()
    return jsonify({'message': 'Produto atualizado'})