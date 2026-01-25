from flask import Flask
from flask_jwt_extended import JWTManager
from backend.models import db
from backend.routes.animais_routes import animais_bp
from backend.routes.financeiro_routes import financeiro_bp
from backend.routes.auth_routes import auth_bp
# Importar outras blueprints aqui quando forem criadas
from backend.routes.tutores_routes import tutores_bp
from backend.routes.atendimentos_routes import atendimentos_bp
from backend.routes.veterinarios_routes import veterinarios_bp
from backend.routes.prescricao_routes import prescricao_bp

def create_app(database_uri='sqlite:///petclin.db'):
    """Cria e configura a aplicação Flask."""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this' # Trocar por env var em produção

    db.init_app(app)
    jwt = JWTManager(app)

    # Registrar Blueprints (rotas)
    app.register_blueprint(animais_bp)
    app.register_blueprint(financeiro_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(tutores_bp)
    app.register_blueprint(atendimentos_bp)
    app.register_blueprint(veterinarios_bp)
    app.register_blueprint(prescricao_bp)

    with app.app_context():
        # Cria as tabelas no banco de dados, se não existirem
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)