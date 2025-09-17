'use client';

        import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(undefined);

        export function NotificationProvider({ children }) {
          const [notifications, setNotifications] = useState([]);
          
          // Clear notifications on page load/refresh
          useEffect(() => {
            console.log('🔔 NotificationProvider: Clearing notifications on page load');
            setNotifications([]);
          }, []);

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
            
            // Don't add to persistent notifications - only show toast
            // This prevents showing old notifications on page refresh
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