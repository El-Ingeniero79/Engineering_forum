
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Profile() {
  const { user } = useAuth(); // Obtener el usuario autenticado
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [postPage, setPostPage] = useState(1); // Para controlar la paginación de posts
  const [commentPage, setCommentPage] = useState(1); // Para controlar la paginación de comentarios
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [nick, setNick] = useState(''); 
  const postsPerPage = 5;
  const commentsPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((postPage - 1) * postsPerPage, postPage * postsPerPage - 1);
      if (!error) setPosts((prevPosts) => [...prevPosts, ...data]);
      else console.error('Error fetching posts:', error);
      setLoadingPosts(false);
    };

    const fetchComments = async () => {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, post_id, profiles!inner(nick)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((commentPage - 1) * commentsPerPage, commentPage * commentsPerPage - 1);
      if (!error) setComments((prevComments) => [...prevComments, ...data]);
      else console.error('Error fetching comments:', error);
      setLoadingComments(false);
    };

    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('nick')
        .eq('id', user.id)
        .single();

      if (!error) {
        setNick(data.nick); // Guardo el nick
      } else {
        console.error('Error fetching user profile:', error);
      }
    };

    if (user) {
      fetchPosts();
      fetchComments();
      fetchUserProfile(); // de los datos del user obtengo el nick
    }
  }, [user, postPage, commentPage]);

  const handleLoadMorePosts = () => {
    setPostPage((prevPage) => prevPage + 1);
  };

  const handleLoadMoreComments = () => {
    setCommentPage((prevPage) => prevPage + 1);
  };

  return (
    <div>
      <h1>Mi perfil</h1>

      
      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nick:</strong> {nick || "Sin nick"}</p>
      </div>

      {/* Sección de Posts */}
      <h2>Mis posts</h2>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.id}`}>{post.title}</Link>
              <p>{post.content}</p>
            </li>
          ))
        ) : (
          <p>No has publicado ningún post.</p>
        )}
      </ul>
      {loadingPosts && <p>Cargando más posts...</p>}
      {!loadingPosts && posts.length >= postsPerPage * postPage && (
        <button onClick={handleLoadMorePosts}>Ver más posts</button>
      )}

      {/* Sección de Comentarios */}
      <h2>Mis comentarios</h2>
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.id}>
              <Link to={`/post/${comment.post_id}`}>Ver post</Link>
              <p>{comment.content}</p>
              <small>Escrito por {comment.profiles.nick}</small>
            </li>
          ))
        ) : (
          <p>No has hecho ningún comentario.</p>
        )}
      </ul>
      {loadingComments && <p>Cargando más comentarios...</p>}
      {!loadingComments && comments.length >= commentsPerPage * commentPage && (
        <button onClick={handleLoadMoreComments}>Ver más comentarios</button>
      )}
    </div>
  );
}

export default Profile;
