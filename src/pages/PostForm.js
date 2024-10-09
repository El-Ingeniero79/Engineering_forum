import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; // Importar el hook useNavigate
import '../CreateForm.css';

function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [restricted, setRestricted] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate(); // Crear la instancia de useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = { 
      title, 
      content, 
      restricted 
    };

    // Para depuración
    console.log('Datos enviados:', formData);

    try {
      await axios.post('http://localhost:5000/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}` // Asegúrate de que 'token' no sea undefined o vacío
        }
      });
      alert('Post creado con éxito');
      
      // Redirigir a la página de inicio después de la creación exitosa
      navigate('/'); 
      
      // Resetear el formulario si es necesario
      setTitle('');
      setContent('');
      setRestricted(false);
    } catch (error) {
      // Manejo de errores más detallado
      console.error('Error creando el post:', error.response ? error.response.data : error);
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
