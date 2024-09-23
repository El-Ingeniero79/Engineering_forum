
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Post.css';
import '../PostDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function PostDetail() {
  const { id } = useParams(); // Obtener el ID del post
  const { user } = useAuth(); // Obtener el usuario autenticado
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(null); // Para editar comentarios ver porque no me deja publicar comentarios
  const [editingContent, setEditingContent] = useState('');
  const [isEditingPost, setIsEditingPost] = useState(false); // Para editar post
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.log(error);
      else setPost(data);
    };

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('content, created_at, user_id, profiles!inner(nick)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });
      if (error) console.log(error);
      else setComments(data || []);
    };

    fetchPost();
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent) return;

    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: id, user_id: user.id, content: commentContent }]);

    if (error) {
      console.error(error);
    } else {
      setCommentContent('');
      const { data } = await supabase
        .from('comments')
        .select('content, created_at, user_id, profiles!inner(nick)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });
      setComments(data || []);
    }
  };

  const handleCommentDelete = async (commentId) => {
    await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  const handlePostDelete = async () => {
    await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    navigate('/'); // Redirigir al incio al usuario después de eliminar el post
  };

  const handleCommentEdit = async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .update({ content: commentContent })
      .eq('id', commentId);

    if (!error) {
      setIsEditingComment(null);
      setCommentContent('');
      const { data } = await supabase
        .from('comments')
        .select('content, created_at, user_id, profiles!inner(nick)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });
      setComments(data || []);
    }
  };

  const handlePostEdit = async () => {
    const { error } = await supabase
      .from('posts')
      .update({ content: post.content })
      .eq('id', id);

    if (!error) {
      setIsEditingPost(false);
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      setPost(data);
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
        

        {/* Mostrar comentarios ver porque no me los guarda*/}
        <h2>Respuestas</h2>
        <div>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                {isEditingComment === comment.id ? (
                  <>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <button onClick={() => handleCommentEdit(comment.id)}>
                      Guardar cambios
                    </button>
                    <button onClick={() => setIsEditingComment(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <p>{comment.content}</p>
                    <small>Escrito por {comment.profiles.nick} el {new Date(comment.created_at).toLocaleString()}</small>
                    {user && user.id === comment.user_id && (
                      <>
                        <button onClick={() => { setIsEditingComment(comment.id); setEditingContent(comment.content); }} className="icon-button">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button onClick={() => handleCommentDelete(comment.id)} className="icon-button">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    )}


                  </>
                )}
              </div>
            ))
          ) : (
            <p>No hay respuestas todavía.</p>
          )}
        </div>

        {/* Agregar respuesta */}
        {user && (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Escribe una respuesta..."
            />
            <button type="submit">Responder</button>
          </form>
        )}
      </div>
  </div>
  );
}

export default PostDetail;
