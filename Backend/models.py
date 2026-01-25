from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Tutor(db.Model):
    __tablename__ = 'tutores'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    endereco = db.Column(db.String(200))
    cidade = db.Column(db.String(100))
    
    animais = relationship("Animal", back_populates="tutor")

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cpf': self.cpf,
            'telefone': self.telefone,
            'email': self.email,
            'endereco': self.endereco,
            'cidade': self.cidade
        }

class Animal(db.Model):
    __tablename__ = 'animais'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    especie = db.Column(db.String(50))
    raca = db.Column(db.String(50))
    idade = db.Column(db.Integer)
    alergias = db.Column(db.Text)
    vacinas = db.Column(db.Text) # Pode ser um JSON
    
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutores.id'), nullable=False)
    tutor = relationship("Tutor", back_populates="animais")

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'especie': self.especie,
            'raca': self.raca,
            'idade': self.idade,
            'alergias': self.alergias,
            'vacinas': self.vacinas,
            'tutor_id': self.tutor_id,
            'tutor_nome': self.tutor.nome if self.tutor else None
        }

class LancamentoFinanceiro(db.Model):
    __tablename__ = 'lancamentos_financeiros'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(50), nullable=False) # Receita ou Despesa
    descricao = db.Column(db.String(200), nullable=False)
    categoria = db.Column(db.String(100))
    valor = db.Column(db.Float, nullable=False)
    data_vencimento = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), nullable=False) # Pago, Pendente
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tipo': self.tipo,
            'descricao': self.descricao,
            'categoria': self.categoria,
            'valor': self.valor,
            'data_vencimento': self.data_vencimento.isoformat(),
            'status': self.status,
        }

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(50), default='veterinario') # admin, veterinario, recepcionista

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'tipo': self.tipo
        }