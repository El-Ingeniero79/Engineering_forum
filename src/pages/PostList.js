import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../Post.css';
import '../PostDetail.css';

function PostList({ searchTerm }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('posts')
        .select('id, title, content, restricted, image_url, user_id, profiles!inner(nick)')
        .order('created_at', { ascending: false });

      if (!user) {
        // Mostrar solo posts no restringidos si el usuario no está autenticado
        query = query.eq('restricted', false);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        // Filtrar posts según el término de búsqueda
        const filteredPosts = data.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPosts(filteredPosts);
      }
    };

    fetchPosts();
  }, [user, searchTerm]);

  return (
    <div className="post-detail-container">
      <div className="post-list">
        {posts.length > 0 ? (
          posts.map((post) => {
            const isRestrictedAndNotLoggedIn = post.restricted && !user;
            return (
              <div key={post.id} className={`post-container ${isRestrictedAndNotLoggedIn ? 'restricted-post' : ''}`}>
                <Link to={`/post/${post.id}`}>
                  <h3>{post.title}</h3>
                </Link>
                <p><strong>Autor:</strong> {post.profiles.nick}</p>

                {/* Mostrar la imagen si está presente */}
                {post.image_url && (
                  <div className="post-image">
                    <img src={post.image_url} alt={post.title} />
                  </div>
                )}
                
                <p>{isRestrictedAndNotLoggedIn ? 'Este mensaje está restringido.' : post.content.substring(0, 50) + '...'}</p>
              </div>
            );
          })
        ) : (
          <p>No hay posts disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default PostList;
