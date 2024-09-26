import React, { useState } from 'react';
import axios from 'axios';  // Usamos Axios para las solicitudes HTTP
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../Form.css'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nick, setNick] = useState(''); 
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Comprobación de contraseñas
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(''); // Limpiar cualquier error anterior

      // Aquí registramos el usuario
      const response = await axios.post('/api/register', {
        email,
        password,
        nick
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Navegar a la página principal si el registro fue exitoso
      navigate('/');
    } catch (error) {
      setError('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nick"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
