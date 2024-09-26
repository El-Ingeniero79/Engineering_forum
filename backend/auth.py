from flask import Blueprint, request, jsonify
from models import db, User, bcrypt
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
import logging

auth_bp = Blueprint('auth', __name__)


logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    nick = data.get('nick')

    if not email or not password or not nick:
        logger.error('Faltan campos en la solicitud de registro')
        return jsonify(message="Todos los campos son obligatorios"), 400

    
    if '@' not in email:
        logger.error(f'Formato de email inválido: {email}')
        return jsonify(message="Formato de email inválido"), 400

    try:
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
