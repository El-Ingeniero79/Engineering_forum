import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Post.css';
import '../PostDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function PostDetail() {
  const { id } = useParams();
  const { user, token } = useAuth(); 
  const [post, setPost] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error obteniendo el post:', error);
      }
    };
    fetchPost();
  }, [id]);

  const handlePostDelete = async () => {
    try {
      await axios.delete(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/');
    } catch (error) {
      console.error('Error eliminando el post:', error);
    }
  };

  const handlePostEdit = async () => {
    try {
      await axios.put(`/posts/${id}`, { content: post.content }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsEditingPost(false);
      const response = await axios.get(`/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error editando el post:', error);
    }
  };

  if (!post) return <div>Loading...</div>;

  // Formatear la fecha de creación
  const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Verificar si el post es restringido y si el usuario está autenticado
  if (post.restricted && !user) {
    return (
      <div className="post-detail-container">
        <div className="post-container">
          <h1>{post.title}</h1>
          <p>Este post está restringido. Debes iniciar sesión para verlo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="post-container">
        <h1>{post.title || 'Título no disponible'}</h1>
        <div className="post-meta">
          <p><strong>Autor:</strong> {post.author?.nick || 'Autor desconocido'}</p> 
                   
          <p><strong>Fecha de creación:</strong> {formattedDate}</p> 
        </div>
        {isEditingPost ? (
          <>
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
            />
            <button onClick={handlePostEdit}>Guardar cambios</button>
          </>
        ) : (
          <p>{post.content}</p>
        )}

        {user && user.id === post.user_id && (
          <div className="post-actions">
            <button onClick={() => setIsEditingPost(!isEditingPost)} className="icon-button">
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button onClick={handlePostDelete} className="icon-button boton_borrar">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail;
