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
        const response = await axios.get('/posts'); // Obtener todos los posts
        // Ordenamos por fecha de creación (suponiendo que tienes un campo "created_at")
        const sortedPosts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        // Seleccionamos los 5 más recientes
        const latestPosts = sortedPosts.slice(0, 5);
        setPosts(latestPosts);
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
          <h1>Foro de Soluciones Técnicas Sencillas</h1>
          <p>Bienvenid@s a este foro profesional. En este foro trataremos temas específicos pero para demostrar que tenemos un 
            conocimiento muy avanzado, daremos explicaciones sencillas a problemas complicados.</p>
          <p>Os recordamos nuestro mantra:</p>
          <br></br>
          <p className='cita'> <i>"Si no lo puedes explicar de forma sencilla,<br></br> es que no lo has entendido bien"</i><br></br> <b>Albert Einstein</b></p>
          <br></br>
          <div className='normas'>
            <h2>Normas del foro:</h2>
            <ol>
              <li>El registro es gratuito.</li>
              <li>Ventajas de estar registrad@:
                <ol type="a">
                  <li>Acceso a todo el contenido (libre y restringido).</li>
                  <li>Podrás escribir posts iniciar temas y decidir si es abierto a todo el mundo o restringido a solo resgistrad@s. </li>
                  <li>seras la primera persona en recibir nuestras novedades.</li>
                </ol>
              </li>
              <li>Recuerda dar las explicaciones como te gustaría recibirlas.</li>
              <li>Intenta participar todo lo que puedas, ya que así fomentaremos el interés de la gente por aprender.</li>
            </ol>
          </div>
        </div>

        <div className="latest-posts-container">
          <h2>Últimos posts</h2>
          <div className="chat-window">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="chat-message">
                  <h3 className="chat-title">{post.title}</h3>
                  <p className="chat-content">
                    {post.restricted && !user
                      ? 'Contenido restringido. Regístrate para ver más.'
                      : truncateText(post.content, 50)}
                  </p>
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
