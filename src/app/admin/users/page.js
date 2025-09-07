'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        fetchUsers();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

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
        setUsers(data.users || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading User Management...</p>
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
            <h1>👥 User Management</h1>
            <p>Manage all users in the Smart Garden system</p>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <div className="user-management">
          <div className="user-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="add-user-btn">
              + Add New User
            </button>
          </div>

          <div className="users-table">
            <div className="table-header">
              <div className="table-cell">Name</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Plan</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Actions</div>
            </div>
            
            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="table-row">
                  <div className="table-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="user-name">{user.firstName} {user.lastName}</div>
                        <div className="user-address">{user.homeAddress}</div>
                      </div>
                    </div>
                  </div>
                  <div className="table-cell">{user.email}</div>
                  <div className="table-cell">
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'super_admin' ? '👑 Super Admin' : '👤 User'}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span className={`plan-badge ${user.subscriptionPlan}`}>
                      {user.subscriptionPlan}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge ${user.isVerified ? 'verified' : 'pending'}`}>
                      {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
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

        .user-management {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .user-controls {
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

        .add-user-btn {
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .add-user-btn:hover {
          transform: translateY(-2px);
        }

        .users-table {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          border-bottom: 1px solid #e0e0e0;
          transition: background 0.3s ease;
        }

        .table-row:hover {
          background: #f8f9fa;
        }

        .table-cell {
          padding: 1rem;
          display: flex;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
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

        .user-name {
          font-weight: 600;
          color: #333;
        }

        .user-address {
          font-size: 0.9rem;
          color: #666;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .role-badge.super_admin {
          background: #ff6b6b;
          color: white;
        }

        .role-badge.user {
          background: #e3f2fd;
          color: #1976d2;
        }

        .plan-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .plan-badge.premium {
          background: #fff3e0;
          color: #f57c00;
        }

        .plan-badge.basic {
          background: #e8f5e8;
          color: #4caf50;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.verified {
          background: #e8f5e8;
          color: #4caf50;
        }

        .status-badge.pending {
          background: #fff3e0;
          color: #f57c00;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          background: #e3f2fd;
          color: #1976d2;
        }

        .action-btn.edit:hover {
          background: #bbdefb;
        }

        .action-btn.delete {
          background: #ffebee;
          color: #d32f2f;
        }

        .action-btn.delete:hover {
          background: #ffcdd2;
        }

        .no-users {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .user-management {
            padding: 1rem;
          }

          .user-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .table-cell {
            padding: 0.5rem;
            border-bottom: 1px solid #e0e0e0;
          }

          .table-cell:before {
            content: attr(data-label);
            font-weight: 600;
            color: #666;
            display: block;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
