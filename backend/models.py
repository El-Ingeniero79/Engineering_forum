from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.orm import validates
import re

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)  # Índice añadido
    password = db.Column(db.String(255), nullable=False)  # Campo de tamaño aumentado
    nick = db.Column(db.String(50), unique=True, nullable=False, index=True)  # Índice añadido
    posts = db.relationship('Post', backref='author', lazy=True)

    
    @validates('email')
    def validate_email(self, key, address):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", address):
            raise ValueError("El formato del email no es válido")
        return address

    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'nick': self.nick
            # Contraseña excluida por razones de seguridad
        }

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    restricted = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'restricted': self.restricted,
            'user_id': self.user_id,
            'author': {
                'id': self.author.id,
                'nick': self.author.nick
            }
        }
