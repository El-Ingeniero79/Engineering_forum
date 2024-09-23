 
import React, { useState } from 'react';
import PostList from './PostList';
import '../Post.css';

function Posts() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value); // Actualizar el estado de búsqueda
  };

  return (
    <div className="posts-container">
      <h1>Posts</h1>

      <div className="posts-content">
        
        

        {/* Renderizar la lista de posts */}
        <PostList searchTerm={searchTerm} /> {/* Pasar el término de búsqueda a PostList */}

        {/* Barra de búsqueda revisar porque al buyscar el fondo y archivo q1ueda mas pequeño*/}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={handleSearch} // Actualizar la búsqueda
          />
        </div>
      </div>
    </div>
  );
}

export default Posts;
