from flask import Blueprint, request, jsonify
from models import db, Post
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging


logger = logging.getLogger(__name__)

posts_bp = Blueprint('posts', __name__)


@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        posts = Post.query.all()
        return jsonify([post.serialize() for post in posts]), 200
    except Exception as e:
        logger.error(f"Error al obtener los posts: {e}")
        return jsonify({'message': 'Error interno del servidor'}), 500


@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()

    
    if not data or not data.get('title') or not data.get('content'):
        logger.error("Faltan campos 'title' o 'content' en la solicitud de creación de post")
        return jsonify({'message': "Faltan campos 'title' o 'content'"}), 400

    try:
        
        post = Post(
            title=data['title'],
            content=data['content'],
            user_id=get_jwt_identity() 
        )
        
        db.session.add(post)
        db.session.commit()

        logger.info(f"Post creado exitosamente por el usuario ID {post.user_id}")
        return jsonify(post.serialize()), 201
    
    except Exception as e:
        logger.error(f"Error al crear el post: {e}")
        db.session.rollback()  # Hacer rollback en caso de error
        return jsonify({'message': 'Error interno del servidor'}), 500
