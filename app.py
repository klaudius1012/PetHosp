from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from backend.models import db
from backend.routes.animal_routes import animal_bp
from backend.routes.financeiro_routes import financeiro_bp
from backend.routes.auth_routes import auth_bp
from backend.routes.tutores_routes import tutores_bp
from backend.routes.atendimento_routes import atendimento_bp
from backend.routes.veterinarios_routes import veterinarios_bp
from backend.routes.prescricao_routes import prescricao_bp
from backend.routes.agenda_routes import agenda_bp
from backend.routes.estoque_routes import estoque_bp
from backend.routes.classe_terapeutica_routes import classe_terapeutica_bp
from backend.routes.evolucao_routes import evolucao_bp
from backend.routes.internacao_routes import internacao_bp
import os

def create_app():
    # Configura a pasta estática para servir arquivos do frontend
    app = Flask(__name__, static_folder=None)
    
    # Configuração do Banco de Dados (Caminho absoluto para evitar erros)
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'backend', 'database', 'petclin.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this'

    db.init_app(app)
    jwt = JWTManager(app)

    # Registrar Rotas da API
    app.register_blueprint(animal_bp, url_prefix='/animais')
    app.register_blueprint(financeiro_bp, url_prefix='/financeiro')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(tutores_bp, url_prefix='/tutores')
    app.register_blueprint(atendimento_bp, url_prefix='/atendimentos')
    app.register_blueprint(veterinarios_bp, url_prefix='/veterinarios')
    app.register_blueprint(prescricao_bp, url_prefix='/prescricoes')
    app.register_blueprint(agenda_bp, url_prefix='/agenda')
    app.register_blueprint(estoque_bp, url_prefix='/estoque')
    app.register_blueprint(classe_terapeutica_bp, url_prefix='/classes-terapeuticas')
    app.register_blueprint(evolucao_bp, url_prefix='/evolucoes')
    app.register_blueprint(internacao_bp, url_prefix='/internacoes')

    # Rotas para servir o Frontend
    @app.route('/')
    def index():
        return send_from_directory('.', 'index.html')

    @app.route('/frontend/<path:path>')
    def serve_frontend(path):
        return send_from_directory('frontend', path)

    @app.route('/<path:filename>')
    def serve_root_files(filename):
        return send_from_directory('.', filename)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)