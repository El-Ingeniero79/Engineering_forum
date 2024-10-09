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
  const [originalContent, setOriginalContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/posts/${id}`);
        setPost(response.data);
        setOriginalContent(response.data.content);
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
      setIsEditingPost(false);  // Salir del modo de edición tras guardar
    } catch (error) {
      console.error('Error editando el post:', error);
    }
  };

  const handleCancelEdit = () => {
    setPost({ ...post, content: originalContent });  // Restaurar el contenido original
    setIsEditingPost(false);  // Salir del modo de edición
  };

  const handleGoBack = () => {
    navigate('/posts');
  };

  if (!post) return <div>Loading...</div>;

  const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="post-detail-container">
      <div className="post-container">
        <h1>{post.title || 'Título no disponible'}</h1>
        <div className="post-meta">
          <p><strong>Autor:</strong> {post.author?.nick || 'Autor desconocido'}</p>
          <p><strong>Fecha de creación:</strong> {formattedDate}</p>
        </div>

        <div className="post-content">
          {isEditingPost ? (
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              className="edit-textarea"
            />
          ) : (
            <p>{post.content}</p>
          )}
        </div>

        {user && user.id === post.user_id && (
          <div className="post-actions">
            {isEditingPost ? (
              <>
                <button onClick={handlePostEdit} className="save-button">Guardar</button>
                <button onClick={handleCancelEdit} className="cancel-button">Cancelar</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditingPost(true)} className="icon-button">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={handlePostDelete} className="icon-button boton-borrar">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            )}
          </div>
        )}

        <button className="back-button" onClick={handleGoBack}>Volver a la lista de posts</button>
      </div>
    </div>
  );
}

export default PostDetail;
