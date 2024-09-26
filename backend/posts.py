from flask import Blueprint, request, jsonify
from models import db, Post
from flask_jwt_extended import jwt_required, get_jwt_identity

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([post.serialize() for post in posts]), 200

@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    post = Post(title=data['title'], content=data['content'], user_id=get_jwt_identity())
    db.session.add(post)
    db.session.commit()
    return jsonify(post.serialize()), 201


