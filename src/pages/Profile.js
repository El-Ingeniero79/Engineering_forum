import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../Post.css'

function Profile() {
  const { user } = useAuth(); // Obtenemos la información del usuario autenticado
  const [posts, setPosts] = useState([]); // Lista de posts del usuario
  const [nick, setNick] = useState(''); // El apodo del usuario

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Obtenemos los posts del usuario autenticado
        const postResponse = await axios.get('http://localhost:5000/posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Filtramos los posts para obtener solo los creados por el usuario autenticado
        const userPosts = postResponse.data.filter(post => post.author.id === user.id);
        setPosts(userPosts);

        // Obtenemos el perfil del usuario autenticado
        const profileResponse = await axios.get(`http://localhost:5000/users/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setNick(profileResponse.data.nick);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (user) fetchProfileData();
  }, [user]);

  // Función para eliminar un post
  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Actualizamos la lista de posts después de eliminar
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div>
      <h1>Mi perfil</h1>
      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nick:</strong> {nick || "Sin nick"}</p>
      </div>

      <h2>Mis posts</h2>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.id}`}>
                <h3>{post.title}</h3> {/* Enlace al post completo */}
              </Link>
              <p>{post.content.substring(0, 100)}...</p> {/* Resumen del contenido del post */}
              <Link to={`/edit-post/${post.id}`}>
                <button>Editar</button> {/* Enlace para editar el post */}
              </Link>
              <button className='boton_borrar' onClick={() => handleDelete(post.id)}>Eliminar</button> {/* Botón para eliminar el post */}
            </li>
          ))
        ) : (
          <p>No has publicado ningún post.</p>
        )}
      </ul>
    </div>
  );
}

export default Profile;
