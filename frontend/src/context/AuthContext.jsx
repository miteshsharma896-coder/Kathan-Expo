import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mh_admin_token'));

  async function login(username, password) {
    const { token } = await api.login(username, password);
    localStorage.setItem('mh_admin_token', token);
    setToken(token);
  }

  function logout() {
    localStorage.removeItem('mh_admin_token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
