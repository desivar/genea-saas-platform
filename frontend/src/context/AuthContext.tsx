import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define user types
export type UserRole = 'user' | 'genealogist';

export interface IUser {
  id: string;
  name: string;
  email: string;
  accountTier: 'free' | 'premium';
  role: UserRole;
}

// 2. Define what the context exposes
interface IAuthContext {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  isGenealogist: boolean;
}

// 3. Create the context
const AuthContext = createContext<IAuthContext | null>(null);

// 4. Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on app load
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
      isGenealogist: user?.role === 'genealogist'
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// 5. Custom hook for easy access
export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}