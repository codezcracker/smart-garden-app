'use client';

        import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(undefined);

        export function NotificationProvider({ children }) {
          // Remove persistent notifications - only use toast notifications
          const [notifications, setNotifications] = useState([]);
          
          // Clear notifications on page load/refresh
          useEffect(() => {
            console.log('🔔 NotificationProvider: Clearing notifications on page load');
            setNotifications([]);
          }, []);

  // Simplified notification management - no persistent storage
  const unreadCount = notifications.length; // Show count of current notifications only

  const markAsRead = (id) => {
    // No-op since we don't store notifications
  };

  const markAllAsRead = () => {
    // No-op since we don't store notifications
  };

  const addNotification = (notification) => {
    // Don't store notifications - only show toast
    console.log('🔔 NotificationProvider: Not storing notification, only showing toast');
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