import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../Post.css';
import '../PostDetail.css';

function PostList({ searchTerm }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/posts');
        const filteredPosts = response.data.filter(post =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [searchTerm]);

  return (
    <div className="post-detail-container">
      <div className="post-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className={`post-container ${post.restricted && !user ? 'restricted-post' : ''}`}>
              <Link to={`/post/${post.id}`}>
                <h3>{post.title || 'Título no disponible'}</h3>
              </Link>
              <p><strong>Autor:</strong> {post.author?.nick || 'Autor desconocido'}</p>
              <p>{post.restricted && !user ? 'Este mensaje está restringido.' : (post.content ? post.content.substring(0, 50) + '...' : 'Contenido no disponible')}</p>
              {post.image_url && <img src={post.image_url} alt="Post Attachment" className="post-image" />}
            </div>
          ))
        ) : (
          <p>No hay posts disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default PostList;