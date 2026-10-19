import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getOfflineQueue } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_health_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(() => getOfflineQueue().length);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Auto sync when reconnected
      const queue = getOfflineQueue();
      if (queue.length > 0 && user) {
        setSyncing(true);
        try {
          const res = await api.syncOfflineBatch();
          setOfflineCount(0);
          setSyncMessage(`Synced ${res.successfullySynced} offline observation(s) successfully!`);
          setTimeout(() => setSyncMessage(null), 5000);
        } catch (err) {
          console.error('Auto-sync failed:', err);
        } finally {
          setSyncing(false);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const login = async (username, password) => {
    const data = await api.login({ username, password });
    localStorage.setItem('smart_health_token', data.token);
    const userInfo = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      state: data.state,
      districtId: data.districtId,
      districtName: data.districtName,
      subCentre: data.subCentre,
    };
    localStorage.setItem('smart_health_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('smart_health_token');
    localStorage.removeItem('smart_health_user');
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === 'ROLE_ADMIN') return true; // Admin has superuser privileges
    return user.role === role;
  };

  const triggerManualSync = async () => {
    if (!isOnline) {
      alert('Cannot sync: device is currently offline.');
      return;
    }
    setSyncing(true);
    try {
      const res = await api.syncOfflineBatch();
      setOfflineCount(0);
      setSyncMessage(`Synced ${res.successfullySynced} offline records successfully.`);
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      alert('Manual sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const updateOfflineCount = () => {
    setOfflineCount(getOfflineQueue().length);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasRole,
        isOnline,
        offlineCount,
        syncing,
        syncMessage,
        triggerManualSync,
        updateOfflineCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
