import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../.api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);  // Añadido el estado de token

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);  // Guardar el token en el estado
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
    setToken(null);  // Limpiar el token
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      axios.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${storedToken}`;
          return config;
        },
        (error) => Promise.reject(error)
      );
    }

    const checkUser = async () => {
      if (storedToken) {
        try {
          const { data } = await axios.get('/me');
          setToken(storedToken);  // Guardar el token
          setUser(data.user);
        } catch (error) {
          console.error('Error al validar el token:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, token }}>  {/* Añadido token */}
      {children}
    </AuthContext.Provider>
  );
};
