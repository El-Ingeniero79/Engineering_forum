from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)  # Añadí índice
    password = db.Column(db.String(255), nullable=False)  # Aumenté el tamaño del campo
    nick = db.Column(db.String(50), unique=True, nullable=False, index=True)  # Añadí índice
    posts = db.relationship('Post', backref='author', lazy=True)

    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'nick': self.nick
            # No se incluye la contraseña
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
