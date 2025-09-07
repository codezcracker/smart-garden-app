'use client';
import { useState, useEffect } from 'react';

export default function TestAuth() {
  const [authState, setAuthState] = useState({
    token: null,
    userData: null,
    apiResponse: null
  });

  useEffect(() => {
    // Check localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    setAuthState(prev => ({
      ...prev,
      token,
      userData: userData ? JSON.parse(userData) : null
    }));

    // Test API call if token exists
    if (token) {
      testApiCall(token);
    }
  }, []);

  const testApiCall = async (token) => {
    try {
      const response = await fetch('/api/devices/register', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setAuthState(prev => ({
        ...prev,
        apiResponse: { status: response.status, data }
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        apiResponse: { error: error.message }
      }));
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'demo@smartgarden.com',
          password: 'demo123456'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        setAuthState({
          token: data.token,
          userData: data.user,
          apiResponse: { status: response.status, data }
        });
        
        // Test API call
        testApiCall(data.token);
      }
    } catch (error) {
      console.error('Login test failed:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setAuthState({
      token: null,
      userData: null,
      apiResponse: null
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLogin} style={{ marginRight: '10px', padding: '10px' }}>
          Test Login
        </button>
        <button onClick={clearAuth} style={{ padding: '10px' }}>
          Clear Auth
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', marginBottom: '20px' }}>
        <h3>Current Auth State:</h3>
        <div><strong>Token:</strong> {authState.token ? 'Present' : 'None'}</div>
        <div><strong>User:</strong> {authState.userData ? authState.userData.email : 'None'}</div>
      </div>

      {authState.token && (
        <div style={{ background: '#e8f5e8', padding: '15px', marginBottom: '20px' }}>
          <h3>Token Details:</h3>
          <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
            {authState.token}
          </div>
        </div>
      )}

      {authState.userData && (
        <div style={{ background: '#e8f5e8', padding: '15px', marginBottom: '20px' }}>
          <h3>User Data:</h3>
          <pre>{JSON.stringify(authState.userData, null, 2)}</pre>
        </div>
      )}

      {authState.apiResponse && (
        <div style={{ background: '#f0f8ff', padding: '15px', marginBottom: '20px' }}>
          <h3>API Response:</h3>
          <div><strong>Status:</strong> {authState.apiResponse.status}</div>
          <pre>{JSON.stringify(authState.apiResponse.data || authState.apiResponse.error, null, 2)}</pre>
        </div>
      )}

      <div style={{ background: '#fff3cd', padding: '15px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Login" to authenticate</li>
          <li>Check if token and user data appear</li>
          <li>Verify API response shows devices</li>
          <li>If everything works, go to <a href="/dashboard">/dashboard</a></li>
        </ol>
      </div>
    </div>
  );
}
