import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('vc_user')); } catch { return null; }
  });
  const [token,   setToken]   = useState(() => localStorage.getItem('vc_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then(res  => { setUser(res.data.user); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('vc_token', newToken);
    localStorage.setItem('vc_user',  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('vc_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
