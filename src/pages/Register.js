
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // comprobado que la importacion esta bien para usar los perfiles
import '../Form.css'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nick, setNick] = useState(''); 
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // comprobacion de que email y contraseña coinciden
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(''); // Limpiar cualquier error anterior

      // aqui registro email y password ver si aqui puede estar el error de registro o es por algun tipo de configaracion de supabase
      const { user, error: authError } = await register(email, password);
      if (authError) throw new Error(authError.message);

      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, nick }]);

      if (profileError) throw new Error(profileError.message);

      // en teoria si el registroi esta ok nos envia al principio para poder navegar
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
