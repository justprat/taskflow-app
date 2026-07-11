import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

// Create the Context object
const AuthContext = createContext(null);

/**
 * AuthProvider component wraps the app and manages authentication state.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);

  // Sync token to axios and fetch user details on load
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Fetch current user details from API
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error("Failed to restore session:", error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  /**
   * Log in user using email and password.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: loggedUser, token: authToken } = response.data.data;
      
      // Save credentials locally
      localStorage.setItem('taskflow_token', authToken);
      localStorage.setItem('taskflow_user', JSON.stringify(loggedUser));
      
      // Update state
      setToken(authToken);
      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed. Please try again.';
    }
  };

  /**
   * Register a new user profile.
   */
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { user: registeredUser, token: authToken } = response.data.data;

      // Save credentials locally
      localStorage.setItem('taskflow_token', authToken);
      localStorage.setItem('taskflow_user', JSON.stringify(registeredUser));

      // Update state
      setToken(authToken);
      setUser(registeredUser);
      setLoading(false);
      return registeredUser;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  /**
   * Log out current user, clear tokens.
   */
  const logout = async () => {
    try {
      // Best effort API logout call
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API logout error as we clear locally anyway
    } finally {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext values easily in components.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
