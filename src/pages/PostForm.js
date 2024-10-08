import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import '../CreateForm.css';

function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [restricted, setRestricted] = useState(false);
  const { token } = useAuth();  // Obtenemos el token directamente del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = { 
      title, 
      content, 
      restricted 
    };

    console.log('Datos enviados:', formData);

    // Asegurarse de que el token está presente antes de enviar la solicitud
    if (!token) {
      console.error('Token JWT no disponible');
      alert('Error de autenticación. Inicia sesión nuevamente.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Post creado con éxito');
      setTitle('');
      setContent('');
      setRestricted(false);
    } catch (error) {
      console.error('Error creando el post:', error.response ? error.response.data : error);
      alert(`Error creando el post: ${error.response ? error.response.data.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="postform-container">
      <div className="postform-card">
        <h1 className="form-title">Crear Post</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Contenido"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-control textarea"
              required
            />
          </div>
          <div className="restricted-label">
            <label>
              <input
                type="checkbox"
                checked={restricted}
                onChange={(e) => setRestricted(e.target.checked)}
              />
              Post Restringido
            </label>
          </div>
          <button type="submit" className="btn-primary">Crear Post</button>
        </form>
      </div>
    </div>
  );
}

export default PostForm;
