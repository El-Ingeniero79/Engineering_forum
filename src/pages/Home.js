
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; 
import '../Home.css'; 

function Home() {
  const { user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!user) {
        // Si no está autenticado, solo mostrar posts no restringidos
        query = query.eq('restricted', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
  }, [user]); // Ejecutar cada vez que el estado de autenticación cambie

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home-container"> 
      <div className="content-wrapper">
        <div className="main-content">
          <h1>Foro de Ingeniería</h1>
          <p>Bienvenid@s a este foro profesional de ingeniería. En este foro trataremos temas específicos de esta profesión.</p>
        </div>

        <div className="latest-posts-container">
          <h2>Últimos posts</h2>
          <div className="chat-window">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="chat-message">
                  <h3 className="chat-title">{post.title}</h3>
                  <p className="chat-content">{truncateText(post.content, 50)}</p>
                </div>
              ))
            ) : (
              <p>No hay posts disponibles.</p>
            )}
          </div>

        
          <div className="view-more">
            <Link to="/posts">Ver más</Link> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
