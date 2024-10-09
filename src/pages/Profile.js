// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import { Link, useNavigate } from 'react-router-dom'; // Importamos useNavigate
// import '../Post.css';

// function Profile() {
//   const { user, loading } = useAuth(); // Incluimos loading para verificar el estado de carga
//   const [posts, setPosts] = useState([]); // Lista de posts del usuario
//   const [nick, setNick] = useState(''); // El apodo del usuario
//   const navigate = useNavigate(); // Para redirigir al usuario

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         // Obtenemos los posts del usuario autenticado
//         const postResponse = await axios.get('http://localhost:5000/posts', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });

//         // Filtramos los posts para obtener solo los creados por el usuario autenticado
//         const userPosts = postResponse.data.filter(post => post.author.id === user.id);
//         setPosts(userPosts);

//         // Obtenemos el perfil del usuario autenticado
//         const profileResponse = await axios.get(`http://localhost:5000/users/${user.id}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });
//         setNick(profileResponse.data.nick);
//       } catch (error) {
//         console.error('Error fetching profile data:', error);
//       }
//     };

//     // Esperamos a que los datos del usuario estén listos y no estemos cargando
//     if (user && !loading) {
//       fetchProfileData();
//     }
//   }, [user, loading]); // Añadido loading como dependencia

//   // Función para eliminar un post
//   const handleDelete = async (postId) => {
//     try {
//       await axios.delete(`http://localhost:5000/posts/${postId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       // Actualizamos la lista de posts después de eliminar
//       setPosts(posts.filter(post => post.id !== postId));
//     } catch (error) {
//       console.error('Error deleting post:', error);
//     }
//   };

//   // Función para manejar la edición de un post
//   const handleEdit = (postId) => {
//     // Redirigimos al usuario a la página de edición del post
//     navigate(`/edit-post/${postId}`);
//   };

//   if (loading) return <p>Cargando perfil...</p>; // Mostrar un mensaje mientras carga

//   return (
//     <div>
//       <h1>Mi perfil</h1>
//       <div>
//         <p><strong>Email:</strong> {user.email}</p>
//         <p><strong>Nick:</strong> {nick || "Sin nick"}</p>
//       </div>

//       <h2>Mis posts</h2>
//       <ul>
//         {posts.length > 0 ? (
//           posts.map((post) => (
//             <li key={post.id}>
//               <Link to={`/post/${post.id}`}>
//                 <h3>{post.title}</h3> {/* Enlace al post completo */}
//               </Link>
//               <p>{post.content.substring(0, 100)}...</p> {/* Resumen del contenido del post */}
//               {/* <button onClick={() => handleEdit(post.id)}>Editar</button> 
//               <button className='boton_borrar' onClick={() => handleDelete(post.id)}>Eliminar</button>              */}
//             </li>
//           ))
//         ) : (
//           <p>No has publicado ningún post.</p>
//         )}
//       </ul>
//     </div>
//   );
// }

// export default Profile;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../Post.css';

function Profile() {
  const { user, loading } = useAuth();  // Usamos el usuario y loading desde el AuthContext
  const [posts, setPosts] = useState([]); // Lista de posts del usuario
  const navigate = useNavigate();  // Para redirigir al usuario

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Obtenemos los posts del usuario autenticado
        const postResponse = await axios.get('http://localhost:5000/posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Filtramos los posts para obtener solo los creados por el usuario autenticado
        const userPosts = postResponse.data.filter(post => post.user_id === user.id);
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    // Esperamos a que los datos del usuario estén listos y no estemos cargando
    if (user && !loading) {
      fetchProfileData();
    }
  }, [user, loading]);

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

  // Función para manejar la edición de un post
  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`);  // Redirigimos al usuario a la página de edición del post
  };

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h1>Mi perfil</h1>
      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nick:</strong> {user.nick || "Sin nick"}</p>  {/* Usamos el nick del usuario directamente */}
      </div>

      <h2>Mis posts</h2>
      <p>Aqui tienes todos los posts que has escrito, pincha en el titulo y podras editarlos o borrarlos: </p>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.id}`}>
                <h3>{post.title}</h3>  {/* Enlace al post completo */}
              </Link>
              <p>{post.content.substring(0, 100)}...</p>  {/* Resumen del contenido del post */}
            
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
