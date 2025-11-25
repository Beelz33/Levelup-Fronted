import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext(); 

export function AuthProvider({ children }) {
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUserLevelUp');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("No se pudo leer el usuario del localStorage", error);
      setCurrentUser(null);
    }
    setLoading(false); 
  }, []);

  const login = async (email, password) => {
    // La respuesta 'data' trae: { token: "...", user: {...} }
    const data = await loginUser(email, password);
    
    // 1. Extraemos SOLO los datos del usuario para el estado
    // (Si 'data.user' existe, úsalo. Si no, usa 'data' completo por compatibilidad)
    const userData = data.user || data; 
    
    // 2. Guardamos el token aparte (¡Vital para seguridad futura!)
    if (data.token) {
        localStorage.setItem('tokenLevelUp', data.token);
    }

    // 3. Guardamos el usuario limpio en el estado y localStorage
    setCurrentUser(userData); 
    localStorage.setItem('currentUserLevelUp', JSON.stringify(userData)); 
    
    return userData; 
  };

  const register = async (userData) => {
    const user = await registerUser(userData);
    setCurrentUser(user); 
    localStorage.setItem('currentUserLevelUp', JSON.stringify(user)); 
    return user; 
  };

  const logout = () => {
    setCurrentUser(null); 
    localStorage.removeItem('currentUserLevelUp'); 
    localStorage.removeItem('tokenLevelUp'); // Borramos también el token
  };

  const value = {
    currentUser,
    user: currentUser, // Alias para compatibilidad con Checkout.js
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext); 
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};