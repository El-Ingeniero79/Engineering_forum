from flask import Blueprint, request, jsonify
from models import db, User, bcrypt
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    nick = data.get('nick')

    if not email or not password or not nick:
        return jsonify(message="All fields are required"), 400

    try:
        user = User(
            email=email,
            nick=nick,
            password=bcrypt.generate_password_hash(password).decode('utf-8')
        )
        db.session.add(user)
        db.session.commit()

        return jsonify(message="User registered successfully"), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify(message="User with that email or nick already exists"), 409

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(message="Email and password are required"), 400

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        token = create_access_token(identity=user.id)
        return jsonify(token=token, user={'email': user.email, 'nick': user.nick}), 200

    return jsonify(message="Invalid credentials"), 401
