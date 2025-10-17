// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Ao carregar a aplicação, verifica se há um token no localStorage
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');
    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUsuario(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto de autenticação mais facilmente
export const useAuth = () => {
  return useContext(AuthContext);
};