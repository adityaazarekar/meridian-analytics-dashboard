import React, { useState, useEffect } from 'react';
import App from './App.jsx';
import Login from './Login.jsx';

export default function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('meridian_active_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Pass user info to App, or just a logout callback
  return <App user={user} onLogout={() => {
    localStorage.removeItem('meridian_active_user');
    setUser(null);
  }} />;
}