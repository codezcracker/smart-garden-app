'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !userData) {
        router.push('/auth/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.role !== 'super_admin') {
          router.push('/dashboard');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>👑 Super Admin Panel</h1>
            <p>Welcome back, {user.firstName} {user.lastName}</p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">0</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌱</div>
              <div className="stat-content">
                <h3>Active Gardens</h3>
                <p className="stat-number">0</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📱</div>
              <div className="stat-content">
                <h3>Connected Devices</h3>
                <p className="stat-number">0</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Data Points</h3>
                <p className="stat-number">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-grid">
          <div className="admin-card">
            <div className="card-header">
              <h2>👥 User Management</h2>
              <p>Manage all users in the system</p>
            </div>
            <div className="card-content">
              <div className="admin-actions">
                <button className="admin-btn primary" onClick={() => router.push('/admin/users')}>
                  View All Users
                </button>
                <button className="admin-btn secondary">
                  Add New User
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-header">
              <h2>📈 System Analytics</h2>
              <p>View system-wide analytics and reports</p>
            </div>
            <div className="card-content">
              <div className="admin-actions">
                <button className="admin-btn primary" onClick={() => router.push('/admin/analytics')}>
                  View Analytics
                </button>
                <button className="admin-btn secondary">
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-header">
              <h2>⚙️ System Settings</h2>
              <p>Configure system-wide settings</p>
            </div>
            <div className="card-content">
              <div className="admin-actions">
                <button className="admin-btn primary">
                  System Config
                </button>
                <button className="admin-btn secondary">
                  Database Settings
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-header">
              <h2>🔒 Security</h2>
              <p>Monitor security and access logs</p>
            </div>
            <div className="card-content">
              <div className="admin-actions">
                <button className="admin-btn primary">
                  Security Logs
                </button>
                <button className="admin-btn secondary">
                  Access Control
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }

        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .admin-header {
          margin-bottom: 2rem;
        }

        .admin-header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-title h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .admin-title p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content h3 {
          color: white;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
          opacity: 0.9;
        }

        .stat-number {
          color: white;
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
        }

        .admin-main {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .admin-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .admin-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header h2 {
          color: #333;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
        }

        .card-header p {
          color: #666;
          margin: 0 0 1.5rem 0;
        }

        .admin-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .admin-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .admin-btn.primary {
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
        }

        .admin-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .admin-btn.secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        .admin-btn.secondary:hover {
          background: #e9e9e9;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .admin-title h1 {
            font-size: 2rem;
          }

          .admin-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .admin-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .admin-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
