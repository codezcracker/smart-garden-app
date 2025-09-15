import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

// Store active WebSocket connections
const connections = new Map();

export async function GET(request) {
  // This is a placeholder for WebSocket server implementation
  // In a real implementation, you would use a WebSocket library like 'ws'
  // For now, we'll use Server-Sent Events (SSE) which is simpler and works well
  
  return new Response(`
    WebSocket server endpoint
    Use Server-Sent Events (SSE) instead: /api/iot/sse
    ESP8266 should connect to: ws://your-domain:3000/api/iot/websocket
  `, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// Function to broadcast to all connected devices
export function broadcastToAllDevices(data) {
  const message = JSON.stringify({
    type: 'broadcast',
    data,
    timestamp: new Date().toISOString()
  });
  
  connections.forEach((connection, deviceId) => {
    try {
      connection.send(message);
    } catch (error) {
      console.error(`Error broadcasting to device ${deviceId}:`, error);
      connections.delete(deviceId);
    }
  });
}

// Function to send message to specific device
export function sendToDevice(deviceId, data) {
  const connection = connections.get(deviceId);
  if (connection) {
    try {
      const message = JSON.stringify({
        type: 'device_message',
        data,
        timestamp: new Date().toISOString()
      });
      connection.send(message);
    } catch (error) {
      console.error(`Error sending to device ${deviceId}:`, error);
      connections.delete(deviceId);
    }
  }
}
