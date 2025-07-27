'use client';

import Navigation from '@/components/Navigation';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🏠 Smart Garden Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your smart garden ecosystem</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Garden Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">🌱 Active Plants</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">📡 Sensors Online</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">🌤️ Current Weather</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">72°F Sunny</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                💧 Water Plants
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                📊 View Analytics
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                ⚙️ Settings
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">🌱</span>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Tomatoes watered</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-500">📡</span>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Temperature alert</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-yellow-500">🌤️</span>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Weather update</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Plant Health Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Excellent</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">8 plants</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Good</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">3 plants</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Needs Attention</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">1 plant</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Watering System</span>
                <span className="text-green-600 dark:text-green-400">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Lighting System</span>
                <span className="text-green-600 dark:text-green-400">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Climate Control</span>
                <span className="text-green-600 dark:text-green-400">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Security</span>
                <span className="text-green-600 dark:text-green-400">● Online</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Weather Forecast</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Today</span>
                <span className="text-gray-900 dark:text-white">72°F Sunny</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tomorrow</span>
                <span className="text-gray-900 dark:text-white">68°F Partly Cloudy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Wednesday</span>
                <span className="text-gray-900 dark:text-white">75°F Sunny</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Thursday</span>
                <span className="text-gray-900 dark:text-white">70°F Rain</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 