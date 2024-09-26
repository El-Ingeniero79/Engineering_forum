from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, bcrypt, User  # Asegúrate de importar el modelo User
from auth import auth_bp
from posts import posts_bp
from dotenv import load_dotenv
import os

# Cargar las variables de entorno
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def create_app():
    app = Flask(__name__)
    
    # Habilitar CORS y permitir el acceso desde tu frontend
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    
    # Configurar la aplicación usando la clase Config
    app.config.from_object(Config)
    
    # Configurar la URI de la base de datos
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

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

# Ruta básica para verificar que el servidor está corriendo
@app.route('/')
def hello_world():
    return '¡Hola, mundo! Esto es Flask funcionando.'

# Ruta de login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Verificar si el JSON contiene email y password
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Faltan datos (email o password)'}), 400

    email = data.get('email')
    password = data.get('password')

    # Buscar usuario por email
    user = User.query.filter_by(email=email).first()
    
    # Verificar la contraseña usando bcrypt
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
    current_user = get_jwt_identity() 
    if current_user:
        return jsonify({'message': f'Autenticado como el usuario {current_user}'}), 200
    else:
        return jsonify({'message': 'No se proporcionó JWT, accediendo como invitado'}), 200

if __name__ == '__main__':
    app.run(debug=True)
