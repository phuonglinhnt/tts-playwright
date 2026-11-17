import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, saveToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const cart = await api('/cart');
      setCartCount(cart.itemCount);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          setUser(await api('/me'));
          await refreshCart();
        } catch {
          clearToken();
        }
      }
      setReady(true);
    })();
  }, [refreshCart]);

  const login = async (email, password, remember) => {
    const result = await api('/auth/login', { method: 'POST', body: { email, password } });
    saveToken(result.token, remember);
    setUser(result.user);
    await refreshCart();
    return result.user;
  };

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* phiên có thể đã hết hạn */
    }
    clearToken();
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, ready, cartCount, setCartCount, refreshCart, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
