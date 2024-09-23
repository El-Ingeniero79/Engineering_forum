// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();  // Actualizado a getSession
      if (error) {
        console.error(error);
      } else {
        setUser(data?.session?.user ?? null);  // Establece el usuario desde la sesión
      }
      setLoading(false);
    };

    getSession();  // Llama a la nueva función getSession para obtener la sesión actual

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);  // Actualiza el estado del usuario cuando cambia la sesión
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();  // Usa el nuevo método unsubscribe en subscription
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });  // Actualizado a signInWithPassword
    if (error) throw error;
    setUser(data.user);  // Actualiza el usuario después de iniciar sesión
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });  // No requiere cambios
    if (error) throw error;
    setUser(data.user);  // Actualiza el usuario después de registrarse
  };

  const logout = async () => {
    await supabase.auth.signOut();  // No requiere cambios
    setUser(null);  // Limpia el estado del usuario al cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
