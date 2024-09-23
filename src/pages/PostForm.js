
import '../App.css';
import "../CreateForm.css"
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';  // Para generar un nombre único para los archivos

function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [restricted, setRestricted] = useState(false);
  const [file, setFile] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);  // Estado para el arrastre del archivo

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return alert('Please login to create a post.');

    try {
      // Intentar insertar el post en la base de datos sin la imagen inicialmente,
      const { data, error } = await supabase
        .from('posts')
        .insert([{ title, content, restricted, user_id: user.id }])
        .single();

      if (error) throw new Error(error.message);

      // Si se ha seleccionado un archivo, subirlo aqui me da error
      if (file) {
        const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;  // Nombre único para el archivo
        const { error: uploadError } = await supabase.storage
          .from('posts') 
          .upload(`${user.id}/${fileName}`, file);

        if (uploadError) throw new Error(uploadError.message);

        
        const imageUrl = `https://cthksshofpgtapimpswm.supabase.co/storage/v1/object/public/posts/${user.id}/${fileName}`;
        const { error: updateError } = await supabase
          .from('posts')
          .update({ image_url: imageUrl })
          .eq('id', data.id);  // Actualizar el post usando el id creado

        if (updateError) throw new Error(updateError.message);
      }

      // Redirigir al usuario a la página de inicio después de crear el post
      navigate('/');
    } catch (error) {
      // en caso de error mostrar el error clarito
      alert(`Error creating post: ${error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Validar si es una imagen
    if (selectedFile && !selectedFile.type.startsWith('image/')) {
      alert('Please upload an image file (jpg, png, etc.)');
      return;
    }
    
    setFile(selectedFile);  // Si el archivo es válido, guardarlo en el estado
  };

  // para arrastrar archivos a adjuntar
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange({ target: { files: [droppedFile] } });
  };

  return (
    <div className="postform-container">
      <form onSubmit={handleSubmit} className="postform-card">
        <h2>Crear nuevo post</h2>
        
        <div className="form-group">
          <label htmlFor="title">Título del mensaje</label>
          <input
            type="text"
            id="title"
            className="form-control"
            placeholder="Escribe el título aquí"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Mensaje</label>
          <textarea
            id="content"
            className="form-control textarea"
            placeholder="Escribe el contenido aquí"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div
          className={`file-upload ${dragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>{file ? file.name : 'Arrastra y suelta una imagen o haz clic para seleccionar un archivo'}</p>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="form-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={restricted}
              onChange={(e) => setRestricted(e.target.checked)}
            />
            Mensaje restringido
          </label>

          <button type="submit" className="btn-primary">
            Crear Post
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostForm;
