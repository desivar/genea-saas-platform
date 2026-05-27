import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'genealogist' | 'user';

export interface IUser {
  id: string;
  name: string;
  email: string;
  accountTier: 'free' | 'premium';
  role: UserRole;
}

interface IAuthContext {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  isGenealogist: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('genea_token');
    const savedUser = localStorage.getItem('genea_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: IUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('genea_token', newToken);
    localStorage.setItem('genea_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('genea_token');
    localStorage.removeItem('genea_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isGenealogist: user?.role === 'genealogist' || user?.role === 'admin',
      isAdmin: user?.role === 'admin'
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}