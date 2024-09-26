import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../Home.css'; 

function Home() {
  const { user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/posts', {
          params: { limit: 5 }
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
