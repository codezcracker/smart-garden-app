'use client';

import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Add toast notification function
  const showToast = (type, message, duration = 5000) => {
    console.log('🔔 NotificationProvider showToast called:', { type, message, duration });
    const event = new CustomEvent('showToast', {
      detail: { type, message, duration }
    });
    console.log('🔔 Dispatching showToast event:', event);
    window.dispatchEvent(event);
    
    // Also add to persistent notifications
    addNotification({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message: message,
      type: type,
    });
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      showToast,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 