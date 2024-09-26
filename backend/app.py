from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS
from Flask_JWT_Extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, bcrypt
from auth import auth_bp
from posts import posts_bp
from dotenv import load_dotenv  # Importamos dotenv para cargar las variables de entorno
import os

# Cargar las variables de entorno desde el archivo .env que está en el directorio raíz
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar la base de datos desde la variable DATABASE_URL del archivo .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    
    # Habilitar CORS para peticiones desde el frontend
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    # Inicializar extensiones
    db.init_app(app)  # Inicializar SQLAlchemy
    Migrate(app, db)
    bcrypt.init_app(app)  # Inicializar bcrypt

    # Cargar la clave secreta JWT desde el archivo .env
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    JWTManager(app)  # Inicializar JWT

    # Registrar Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)

    return app

app = create_app()

@app.route('/')
def hello_world():
    return '¡Hola, mundo! Esto es Flask funcionando.'

# Ruta de login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

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
        return jsonify({'message': 'Credenciales inválidas'}), 401

# Rutas protegidas usando JWT
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'message': f'Autenticado como el usuario {current_user}'}), 200

# Ruta protegida opcionalmente usando JWT
@app.route('/optional-protected', methods=['GET'])
@jwt_required(optional=True)
def optional_protected():
    current_user = get_jwt_identity()  # Retorna None si no hay JWT presente
    if current_user:
        return jsonify({'message': f'Autenticado como el usuario {current_user}'}), 200
    else:
        return jsonify({'message': 'No se proporcionó JWT, accediendo como invitado'}), 200

if __name__ == '__main__':
    app.run(debug=True)
