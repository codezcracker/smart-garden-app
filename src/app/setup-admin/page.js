'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdmin() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    homeAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/setup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          homeAddress: formData.homeAddress
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Super admin created successfully! Redirecting to admin panel...');
        // Store auth data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        // Redirect to admin panel
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create super admin');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-form-wrapper">
        <div className="setup-header">
          <div className="setup-logo">👑</div>
          <h1>Setup Super Admin</h1>
          <p>Create your super admin account to manage the Smart Garden system</p>
        </div>

        <form className="setup-form" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="homeAddress" className="form-label">Home Address</label>
            <input
              type="text"
              id="homeAddress"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleChange}
              className="form-input"
              placeholder="123 Main St, City, State"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Creating Super Admin...
              </>
            ) : (
              'Create Super Admin'
            )}
          </button>
        </form>

        <div className="setup-info">
          <h3>Super Admin Privileges:</h3>
          <ul>
            <li>👑 Full system access and control</li>
            <li>👥 Manage all users and their accounts</li>
            <li>📊 Access system-wide analytics and reports</li>
            <li>⚙️ Configure system settings and preferences</li>
            <li>🔒 Monitor security and access logs</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .setup-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .setup-form-wrapper {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 600px;
          width: 100%;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .setup-logo {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .setup-header h1 {
          color: #333;
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }

        .setup-header p {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .setup-form {
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 600;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #4caf50;
        }

        .form-error {
          background: #ffebee;
          color: #d32f2f;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #ffcdd2;
        }

        .form-success {
          background: #e8f5e8;
          color: #4caf50;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #c8e6c9;
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .setup-info {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .setup-info h3 {
          color: #333;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
        }

        .setup-info ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .setup-info li {
          color: #666;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .setup-container {
            padding: 1rem;
          }

          .setup-form-wrapper {
            padding: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .setup-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
