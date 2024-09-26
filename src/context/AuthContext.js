import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurar URL base de Axios para que apunte al servidor de Flask
  axios.defaults.baseURL = 'http://localhost:5000';

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);  // Guardar datos del usuario
    } catch (error) {
      throw new Error('Falló el inicio de sesión');  // Propagar el error al componente que llama
    }
  };

  const register = async (email, password, nick) => {
    try {
      await axios.post('/register', { email, password, nick });
    } catch (error) {
      throw new Error('Falló el registro');  // Propagar el error al componente que llama
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);  // Limpiar el usuario al cerrar sesión
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await axios.get('/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data.user);  // Guardar datos del usuario
        } catch (error) {
          console.error('Error al validar el token:', error);
          localStorage.removeItem('token');  // Eliminar el token si es inválido
        }
      }
      setLoading(false);  // Finalizar la carga inicial
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
