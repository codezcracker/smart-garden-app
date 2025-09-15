'use client';

import { useState, useEffect, useRef } from 'react';

export default function SSEDebug() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    console.log('🔧 Starting SSE Debug...');
    
    const eventSource = new EventSource('/api/iot/sse');
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log('✅ SSE Connection opened');
      setIsConnected(true);
      addMessage('✅ SSE Connection opened');
    };
    
    eventSource.onmessage = (event) => {
      console.log('📨 SSE Message received:', event.data);
      addMessage(`📨 Message: ${event.data}`);
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      setIsConnected(false);
      addMessage(`❌ SSE Error: ${error.type}`);
    };
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 SSE Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Connection Status:</strong> 
        <span style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </span>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={clearMessages} style={{ padding: '10px', marginRight: '10px' }}>
          Clear Messages
        </button>
        <button onClick={() => window.location.reload()} style={{ padding: '10px' }}>
          Refresh Page
        </button>
      </div>
      
      <div style={{ 
        border: '1px solid #ccc', 
        height: '400px', 
        overflow: 'auto', 
        padding: '10px',
        backgroundColor: '#f5f5f5'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#666' }}>Waiting for messages...</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#666' }}>[{msg.timestamp}]</span> {msg.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
