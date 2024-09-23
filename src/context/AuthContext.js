
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();  
      if (error) {
        console.error(error);
      } else {
        setUser(data?.session?.user ?? null);  
      }
      setLoading(false);
    };

    getSession();  

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);  
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();  
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });  
    if (error) throw error;
    setUser(data.user);  
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });  
    if (error) throw error;
    setUser(data.user);  // Actualiza el usuario después de registrarse
  };

  const logout = async () => {
    await supabase.auth.signOut();  
    setUser(null);  
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
