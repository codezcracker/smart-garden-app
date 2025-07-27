'use client';

import { useNotifications } from '@/components/NotificationProvider';
import Navigation from '@/components/Navigation';

export default function DemoNotifications() {
  const { addNotification } = useNotifications();

  const addDemoNotification = (type) => {
    const notifications = {
      info: {
        title: 'Information Update',
        message: 'This is an informational notification about your garden.',
        type: 'info',
      },
      success: {
        title: 'Operation Successful',
        message: 'Your garden operation has been completed successfully!',
        type: 'success',
      },
      warning: {
        title: 'Warning Alert',
        message: 'Please check your garden sensors - some values are outside normal range.',
        type: 'warning',
      },
      error: {
        title: 'Error Detected',
        message: 'There was an error with your garden automation system.',
        type: 'error',
      },
    };

    addNotification(notifications[type]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔔 Notification Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">Test the notification system by adding different types of notifications</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Info Notification</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add an informational notification</p>
            <button 
              onClick={() => addDemoNotification('info')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Info
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Success Notification</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add a success notification</p>
            <button 
              onClick={() => addDemoNotification('success')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Success
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Warning Notification</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add a warning notification</p>
            <button 
              onClick={() => addDemoNotification('warning')}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Add Warning
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Error Notification</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add an error notification</p>
            <button 
              onClick={() => addDemoNotification('error')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Error
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How to Use</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>1. Click any of the buttons above to add a notification</p>
            <p>2. Click the bell icon &#34;🔔&#34; in the navigation to view notifications</p>
            <p>3. Click on a notification to mark it as read</p>
            <p>4. Use &#34;Mark all read&#34; to mark all notifications as read</p>
            <p>5. Use &#34;Clear all&#34; to remove all notifications</p>
          </div>
        </div>
      </main>
    </div>
  );
} 