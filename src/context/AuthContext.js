import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../.api';  

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);  
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error(error.response?.data?.message || 'Falló el inicio de sesión');
    }
  };

  const register = async (email, password, nick) => {
    try {
      await axios.post('/register', { email, password, nick });
    } catch (error) {
      console.error('Error en register:', error);
      throw new Error(error.response?.data?.message || 'Algo falló en el registro');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);  
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        },
        (error) => Promise.reject(error)
      );
    }

    const checkUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get('/me');
          setUser(data.user);
        } catch (error) {
          console.error('Error al validar el token:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false); 
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
