import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);

const AUTH_KEY = 'trackWiseAuthUser';
const TOKEN_KEY = 'trackWiseAuthToken';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((nextUser, token) => {
    if (nextUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
    }

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else if (!nextUser) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      persistUser(data.user);
      return data.user;
    } catch {
      persistUser(null);
      return null;
    }
  }, [persistUser]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const data = await authApi.me();
        if (active) persistUser(data.user);
      } catch {
        try {
          const stored = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
          if (active && stored) setUser(stored);
        } catch {
          if (active) setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [persistUser]);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      persistUser(data.user, data.token);
      return data.user;
    },
    [persistUser]
  );

  const register = useCallback(
    async (formData) => {
      const data = await authApi.register(formData);
      persistUser(data.user, data.token);
      return data.user;
    },
    [persistUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear client state even if server logout fails
    }
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback(
    async (formData) => {
      const data = await authApi.updateProfile(formData);
      persistUser(data.user);
      return data.user;
    },
    [persistUser]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      setUser: persistUser,
    }),
    [user, loading, login, register, logout, updateUser, refreshUser, persistUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
