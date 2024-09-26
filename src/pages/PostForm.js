import React, { useState } from 'react';
import axios from 'axios';

function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [restricted, setRestricted] = useState(false);
  const userId = 1; // Simulación del usuario autenticado

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { 
      title, 
      content, 
      restricted, 
      user_id: userId 
    };

    try {
      await axios.post('http://localhost:5000/posts', formData);
      alert('Post creado con éxito');
    } catch (error) {
      console.error('Error creando el post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Contenido"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={restricted}
          onChange={(e) => setRestricted(e.target.checked)}
        />
        Post Restringido
      </label>
      <button type="submit">Crear Post</button>
    </form>
  );
}

export default PostForm;
