import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../../backend/src/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  updateUserPreferences: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Initialize theme on mount and when user changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const userTheme = user?.preferences?.theme;
    const themeToUse = userTheme || savedTheme || 'light';
    document.documentElement.setAttribute('data-theme', themeToUse);
    localStorage.setItem('theme', themeToUse);
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Set theme on login
      if (data.user?.preferences?.theme) {
        const theme = data.user.preferences.theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Save current theme preference before logout
    const currentTheme = user?.preferences?.theme || localStorage.getItem('theme') || 'light';
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Preserve theme after logout
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  };

  const updateUserPreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`/api/users/${user.id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update preferences');
      }

      const updatedUser = await response.json();
      
      // Update local storage and state
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update theme immediately if it's being changed
      if (preferences.theme) {
        document.documentElement.setAttribute('data-theme', preferences.theme);
        localStorage.setItem('theme', preferences.theme);
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserPreferences }}>
      {children}
    </AuthContext.Provider>
  );
}; 