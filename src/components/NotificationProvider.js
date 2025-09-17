'use client';

import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Watering Complete',
      message: 'All plants have been watered successfully',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      title: 'Temperature Alert',
      message: 'Greenhouse temperature is above optimal range',
      type: 'warning',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '3',
      title: 'New Plant Added',
      message: 'Tomato plant has been added to your garden',
      type: 'info',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: '4',
      title: 'Sensor Offline',
      message: 'Soil moisture sensor #3 is not responding',
      type: 'error',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
    },
  ]);

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
    const event = new CustomEvent('showToast', {
      detail: { type, message, duration }
    });
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