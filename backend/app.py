from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, bcrypt, User
from auth import auth_bp
from posts import posts_bp
from dotenv import load_dotenv
import os
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def create_app():
    app = Flask(__name__)
    
    
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    
    
    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

    
    db.init_app(app)  
    Migrate(app, db)
    bcrypt.init_app(app) 
    
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    JWTManager(app)  

    
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)

    return app

app = create_app()

# Prueba de que funciona el servidor
@app.route('/')
def hello_world():
    return '¡Hola, mundo! Esto es Flask funcionando.'


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        logger.error('Faltan datos en la solicitud de login')
        return jsonify({'message': 'Faltan datos (email o password)'}), 400

    email = data.get('email')
    password = data.get('password')

    try:
        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'token': access_token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'nick': user.nick
                }
            }), 200
        else:
            logger.error(f'Credenciales inválidas para el usuario: {email}')
            return jsonify({'message': 'Credenciales inválidas'}), 401
    except Exception as e:
        logger.error(f'Error en el proceso de login: {e}')
        return jsonify({'message': 'Error interno del servidor'}), 500


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    nick = data.get('nick')

    if not email or not password or not nick:
        logger.error('Faltan datos en la solicitud de registro')
        return jsonify({'message': 'Faltan datos (email, password o nick)'}), 400

    try:
        
        if User.query.filter_by(email=email).first() or User.query.filter_by(nick=nick).first():
            logger.error(f'El email o nick ya están en uso: {email} - {nick}')
            return jsonify({'message': 'El email o nick ya están en uso'}), 400

        
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(email=email, password=hashed_password, nick=nick)
        db.session.add(new_user)
        db.session.commit()

        logger.info(f'Usuario registrado con éxito: {email}')
        return jsonify({'message': 'Usuario registrado con éxito'}), 201
    except Exception as e:
        logger.error(f'Error en el registro de usuario: {e}')
        return jsonify({'message': 'Error interno del servidor'}), 500


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'message': f'Autenticado como el usuario {current_user}'}), 200
