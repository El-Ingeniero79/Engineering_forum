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
  const { user } = useAuth(); 
  const [post, setPost] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el post
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error obteniendo el post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handlePostDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`);
      navigate('/'); 
    } catch (error) {
      console.error('Error eliminando el post:', error);
    }
  };

  const handlePostEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/posts/${id}`, { content: post.content });
      setIsEditingPost(false);
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error editando el post:', error);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-detail-container">
      <div className="post-container">
        <h1>{post.title}</h1>

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
          <>
            <button onClick={() => setIsEditingPost(!isEditingPost)} className="icon-button">
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button onClick={handlePostDelete} className="icon-button">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PostDetail;
