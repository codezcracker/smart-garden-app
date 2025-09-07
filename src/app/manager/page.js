'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const [managedUsers, setManagedUsers] = useState([]);
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
        if (user.role !== 'manager') {
          router.push('/dashboard');
          return;
        }
        setUser(user);
        fetchManagedUsers();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchManagedUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/manager/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManagedUsers(data.clients || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching managed users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading Manager Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <div className="manager-header-content">
          <div className="manager-title">
            <h1>👨‍💼 Manager Dashboard</h1>
            <p>Welcome back, {user.firstName} {user.lastName}</p>
            <p className="manager-subtitle">Manage your assigned clients and their gardens</p>
          </div>
          <div className="manager-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Clients</h3>
                <p className="stat-number">{managedUsers.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌱</div>
              <div className="stat-content">
                <h3>Active Gardens</h3>
                <p className="stat-number">{managedUsers.reduce((acc, client) => acc + (client.devices?.length || 0), 0)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📱</div>
              <div className="stat-content">
                <h3>Connected Devices</h3>
                <p className="stat-number">{managedUsers.reduce((acc, client) => acc + (client.devices?.length || 0), 0)}</p>
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

      <div className="manager-main">
        <div className="manager-grid">
          <div className="manager-card">
            <div className="card-header">
              <h2>👥 My Clients</h2>
              <p>Manage your assigned clients</p>
            </div>
            <div className="card-content">
              <div className="clients-list">
                {managedUsers.length === 0 ? (
                  <div className="no-clients">
                    <p>No clients assigned yet</p>
                    <p className="no-clients-sub">Contact super admin to get clients assigned to you</p>
                  </div>
                ) : (
                  managedUsers.slice(0, 3).map((client) => (
                    <div key={client._id} className="client-item">
                      <div className="client-avatar">
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                      </div>
                      <div className="client-info">
                        <div className="client-name">{client.firstName} {client.lastName}</div>
                        <div className="client-email">{client.email}</div>
                        <div className="client-devices">{client.devices?.length || 0} devices</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="manager-actions">
                <button 
                  className="manager-btn primary" 
                  onClick={() => router.push('/manager/clients')}
                >
                  View All Clients
                </button>
                <button className="manager-btn secondary">
                  Add New Client
                </button>
              </div>
            </div>
          </div>

          <div className="manager-card">
            <div className="card-header">
              <h2>📊 Client Analytics</h2>
              <p>View analytics for your clients</p>
            </div>
            <div className="card-content">
              <div className="analytics-preview">
                <div className="analytics-item">
                  <span className="analytics-label">Total Gardens:</span>
                  <span className="analytics-value">{managedUsers.length}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Active Devices:</span>
                  <span className="analytics-value">{managedUsers.reduce((acc, client) => acc + (client.devices?.length || 0), 0)}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Data Points Today:</span>
                  <span className="analytics-value">0</span>
                </div>
              </div>
              <div className="manager-actions">
                <button 
                  className="manager-btn primary" 
                  onClick={() => router.push('/manager/analytics')}
                >
                  View Full Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="manager-card">
            <div className="card-header">
              <h2>⚙️ Client Management</h2>
              <p>Manage client accounts and settings</p>
            </div>
            <div className="card-content">
              <div className="management-options">
                <div className="option-item">
                  <span className="option-icon">👤</span>
                  <span className="option-text">Edit Client Profiles</span>
                </div>
                <div className="option-item">
                  <span className="option-icon">🔧</span>
                  <span className="option-text">Configure Devices</span>
                </div>
                <div className="option-item">
                  <span className="option-icon">📱</span>
                  <span className="option-text">Monitor Gardens</span>
                </div>
              </div>
              <div className="manager-actions">
                <button className="manager-btn primary">
                  Manage Clients
                </button>
              </div>
            </div>
          </div>

          <div className="manager-card">
            <div className="card-header">
              <h2>🔔 Recent Activity</h2>
              <p>Latest updates from your clients</p>
            </div>
            <div className="card-content">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">🌱</div>
                  <div className="activity-text">
                    <div className="activity-title">New device connected</div>
                    <div className="activity-time">2 hours ago</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">💧</div>
                  <div className="activity-text">
                    <div className="activity-title">Watering completed</div>
                    <div className="activity-time">4 hours ago</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📊</div>
                  <div className="activity-text">
                    <div className="activity-title">New data received</div>
                    <div className="activity-time">6 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .manager-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
          padding: 2rem 1rem;
        }

        .manager-loading {
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

        .manager-header {
          margin-bottom: 2rem;
        }

        .manager-header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .manager-title h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .manager-title p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
        }

        .manager-subtitle {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 1rem !important;
        }

        .manager-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
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

        .manager-main {
          max-width: 1200px;
          margin: 0 auto;
        }

        .manager-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .manager-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .manager-card:hover {
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

        .clients-list {
          margin-bottom: 1.5rem;
        }

        .no-clients {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .no-clients-sub {
          font-size: 0.9rem;
          color: #999;
          margin-top: 0.5rem;
        }

        .client-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .client-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .client-info {
          flex: 1;
        }

        .client-name {
          font-weight: 600;
          color: #333;
        }

        .client-email {
          font-size: 0.9rem;
          color: #666;
        }

        .client-devices {
          font-size: 0.8rem;
          color: #4caf50;
          font-weight: 600;
        }

        .analytics-preview {
          margin-bottom: 1.5rem;
        }

        .analytics-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .analytics-item:last-child {
          border-bottom: none;
        }

        .analytics-label {
          color: #666;
        }

        .analytics-value {
          font-weight: 600;
          color: #333;
        }

        .management-options {
          margin-bottom: 1.5rem;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .option-item:last-child {
          border-bottom: none;
        }

        .option-icon {
          font-size: 1.2rem;
        }

        .option-text {
          color: #333;
        }

        .activity-list {
          margin-bottom: 1.5rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          font-size: 1.2rem;
        }

        .activity-title {
          font-weight: 600;
          color: #333;
        }

        .activity-time {
          font-size: 0.8rem;
          color: #666;
        }

        .manager-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .manager-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .manager-btn.primary {
          background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
          color: white;
        }

        .manager-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 154, 86, 0.3);
        }

        .manager-btn.secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        .manager-btn.secondary:hover {
          background: #e9e9e9;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .manager-container {
            padding: 1rem;
          }

          .manager-title h1 {
            font-size: 2rem;
          }

          .manager-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .manager-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .manager-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
