from flask import Blueprint, request, jsonify
from models import db, User, bcrypt
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
import logging

auth_bp = Blueprint('auth', __name__)

logger = logging.getLogger(__name__)

# Registro de usuarios
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    nick = data.get('nick')

    # Validaciones
    if not email or not password or not nick:
        logger.error('Faltan campos en la solicitud de registro')
        return jsonify(message="Todos los campos son obligatorios"), 400

    if '@' not in email or '.' not in email.split('@')[-1]:
        logger.error(f'Formato de email inválido: {email}')
        return jsonify(message="Formato de email inválido"), 400

    if len(password) < 8:
        logger.error(f'Contraseña demasiado corta para el usuario: {email}')
        return jsonify(message="La contraseña debe tener al menos 8 caracteres"), 400

    if len(nick) < 3 or not nick.isalnum():
        logger.error(f'Nick inválido: {nick}')
        return jsonify(message="El nick debe tener al menos 3 caracteres y solo contener letras o números"), 400

    try:
        # Crear usuario con contraseña hasheada
        user = User(
            email=email,
            nick=nick,
            password=bcrypt.generate_password_hash(password).decode('utf-8')
        )
        db.session.add(user)
        db.session.commit()

        logger.info(f'Usuario registrado exitosamente: {email}')
        return jsonify(message="Usuario registrado con éxito"), 201

    except IntegrityError:
        db.session.rollback()
        logger.error(f'El usuario con ese email o nick ya existe: {email}')
        return jsonify(message="El usuario con ese email o nick ya existe"), 409

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error inesperado durante el registro: {str(e)}')
        return jsonify(message="Error interno del servidor"), 500

# Login de usuarios
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        logger.error('Faltan campos en la solicitud de login')
        return jsonify(message="Email y contraseña son obligatorios"), 400

    try:
        # Buscar al usuario por email
        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            # Crear el token de acceso
            access_token = create_access_token(identity=user.id)
            logger.info(f'Usuario autenticado exitosamente: {email}')
            return jsonify(
                token=access_token,
                user={
                    'id': user.id,
                    'email': user.email,
                    'nick': user.nick
                }
            ), 200

        else:
            logger.error(f'Credenciales inválidas para el usuario: {email}')
            return jsonify(message="Credenciales inválidas"), 401

    except Exception as e:
        logger.error(f'Error inesperado durante el login: {str(e)}')
        return jsonify(message="Error interno del servidor"), 500
