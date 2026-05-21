/**
 * Auth Context — global authentication state using React Context + localStorage
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fitsync_token');
    const saved = localStorage.getItem('fitsync_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      authAPI.getProfile().then((res) => {
        setUser(res.data.data);
        localStorage.setItem('fitsync_user', JSON.stringify(res.data.data));
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem('fitsync_token', token);
    localStorage.setItem('fitsync_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user: u, token } = res.data.data;
    localStorage.setItem('fitsync_token', token);
    localStorage.setItem('fitsync_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('fitsync_token');
    localStorage.removeItem('fitsync_user');
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await authAPI.getProfile();
    setUser(res.data.data);
    localStorage.setItem('fitsync_user', JSON.stringify(res.data.data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


