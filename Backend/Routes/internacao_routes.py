from flask import Blueprint, request, jsonify, session
import sqlite3

internacao_bp = Blueprint('internacao_bp', __name__)

def get_db_connection():
    conn = sqlite3.connect('backend/database/petclin.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required():
    """Verifica se o usuário está logado na sessão."""
    return 'user_id' in session

@internacao_bp.route('/', methods=['GET'])
def listar_internados():
    """Lista todos os atendimentos com status 'Internado'."""
    if not login_required():
        return jsonify({'error': 'Não autorizado'}), 401
    
    busca = request.args.get('q')
    
    conn = get_db_connection()
    
    sql = '''
        SELECT a.*, t.nome as tutor_nome, an.nome as animal_nome, u.nome as veterinario_nome
        FROM atendimentos a
        LEFT JOIN tutores t ON a.tutor_id = t.id
        LEFT JOIN animais an ON a.animal_id = an.id
        LEFT JOIN usuarios u ON a.veterinario_id = u.id
        WHERE a.status = 'Internado'
    '''
    params = []
    
    if busca:
        termo = f'%{busca}%'
        sql += ' AND (t.nome LIKE ? OR an.nome LIKE ?)'
        params.extend([termo, termo])
    
    sql += ' ORDER BY a.data_hora DESC'
    
    internados = conn.execute(sql, params).fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in internados])