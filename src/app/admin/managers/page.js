'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerManagement() {
  const [user, setUser] = useState(null);
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
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
        fetchManagers();
        fetchUsers();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/managers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManagers(data.managers || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter only regular users (not managers or super admins)
        const regularUsers = data.users.filter(user => user.role === 'user');
        setUsers(regularUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const assignUserToManager = async (userId, managerId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/assign-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, managerId })
      });

      if (response.ok) {
        // Refresh data
        fetchManagers();
        fetchUsers();
        setShowAssignModal(false);
        setSelectedManager(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign user');
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Network error. Please try again.');
    }
  };

  const unassignUserFromManager = async (userId, managerId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/assign-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, managerId })
      });

      if (response.ok) {
        // Refresh data
        fetchManagers();
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to unassign user');
      }
    } catch (error) {
      console.error('Error unassigning user:', error);
      alert('Network error. Please try again.');
    }
  };

  const filteredManagers = managers.filter(manager => 
    manager.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Manager Management...</p>
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
            <button 
              className="back-btn"
              onClick={() => router.push('/admin')}
            >
              ← Back to Admin Panel
            </button>
            <h1>👨‍💼 Manager Management</h1>
            <p>Manage managers and assign clients to them</p>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <div className="manager-management">
          <div className="manager-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="add-manager-btn">
              + Add New Manager
            </button>
          </div>

          <div className="managers-grid">
            {filteredManagers.map((manager) => (
              <div key={manager._id} className="manager-card">
                <div className="manager-header">
                  <div className="manager-avatar">
                    {manager.firstName.charAt(0)}{manager.lastName.charAt(0)}
                  </div>
                  <div className="manager-info">
                    <h3>{manager.firstName} {manager.lastName}</h3>
                    <p>{manager.email}</p>
                    <span className="manager-role">👨‍💼 Manager</span>
                  </div>
                </div>
                
                <div className="manager-stats">
                  <div className="stat">
                    <span className="stat-label">Assigned Clients:</span>
                    <span className="stat-value">{manager.managedUsers?.length || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Devices:</span>
                    <span className="stat-value">{manager.devices?.length || 0}</span>
                  </div>
                </div>

                <div className="manager-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => {
                      setSelectedManager(manager);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign Clients
                  </button>
                  <button className="action-btn secondary">
                    Edit Manager
                  </button>
                </div>

                {manager.managedUsers && manager.managedUsers.length > 0 && (
                  <div className="assigned-clients">
                    <h4>Assigned Clients:</h4>
                    <div className="clients-list">
                      {manager.managedUsers.slice(0, 3).map((clientId) => {
                        const client = users.find(u => u._id === clientId);
                        return client ? (
                          <div key={clientId} className="client-item">
                            <div className="client-avatar">
                              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                            </div>
                            <div className="client-info">
                              <div className="client-name">{client.firstName} {client.lastName}</div>
                              <div className="client-email">{client.email}</div>
                            </div>
                            <button 
                              className="remove-btn"
                              onClick={() => unassignUserFromManager(clientId, manager._id)}
                              title="Remove client"
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                      {manager.managedUsers.length > 3 && (
                        <div className="more-clients">
                          +{manager.managedUsers.length - 3} more clients
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign User Modal */}
      {showAssignModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Clients to {selectedManager.firstName} {selectedManager.lastName}</h2>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedManager(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="available-clients">
                {users.filter(user => !selectedManager.managedUsers?.includes(user._id)).map((user) => (
                  <div key={user._id} className="client-option">
                    <div className="client-avatar">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div className="client-info">
                      <div className="client-name">{user.firstName} {user.lastName}</div>
                      <div className="client-email">{user.email}</div>
                    </div>
                    <button 
                      className="assign-btn"
                      onClick={() => assignUserToManager(user._id, selectedManager._id)}
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {users.filter(user => !selectedManager.managedUsers?.includes(user._id)).length === 0 && (
                  <p className="no-clients">No available clients to assign</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: background 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .admin-title h1 {
          color: white;
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .admin-title p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin: 0;
        }

        .admin-main {
          max-width: 1200px;
          margin: 0 auto;
        }

        .manager-management {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .manager-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4caf50;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .add-manager-btn {
          background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .add-manager-btn:hover {
          transform: translateY(-2px);
        }

        .managers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .manager-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .manager-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .manager-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .manager-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .manager-info h3 {
          margin: 0 0 0.25rem 0;
          color: #333;
        }

        .manager-info p {
          margin: 0 0 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .manager-role {
          background: #ff9a56;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .manager-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          flex: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }

        .manager-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-btn.primary {
          background: #4caf50;
          color: white;
        }

        .action-btn.primary:hover {
          background: #388e3c;
        }

        .action-btn.secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        .action-btn.secondary:hover {
          background: #e9e9e9;
        }

        .assigned-clients {
          border-top: 1px solid #e0e0e0;
          padding-top: 1rem;
        }

        .assigned-clients h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .clients-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .client-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .client-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
        }

        .client-info {
          flex: 1;
        }

        .client-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
        }

        .client-email {
          font-size: 0.8rem;
          color: #666;
        }

        .remove-btn {
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: #ff5252;
        }

        .more-clients {
          text-align: center;
          color: #666;
          font-size: 0.8rem;
          font-style: italic;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .available-clients {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .client-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .client-option:hover {
          background: #f8f9fa;
        }

        .assign-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .assign-btn:hover {
          background: #388e3c;
        }

        .no-clients {
          text-align: center;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .manager-management {
            padding: 1rem;
          }

          .manager-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .managers-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .manager-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
