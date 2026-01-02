import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

/**
 * WebSocket Server Route Handler
 * 
 * Note: Next.js API routes don't support WebSocket connections directly.
 * For WebSocket functionality, use the standalone server: simple-websocket-server.js
 * 
 * This endpoint provides information about WebSocket connections and can be used
 * to send commands to devices via the WebSocket server.
 */

// Store active WebSocket connections (shared with WebSocket server)
// This is a reference - actual connections are managed by simple-websocket-server.js
export const connections = new Map();

// GET: Get WebSocket server information
export async function GET(request) {
  return NextResponse.json({
    message: 'WebSocket server information',
    websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3000/api/iot/websocket',
    status: 'active',
    note: 'Use the standalone WebSocket server (simple-websocket-server.js) for WebSocket connections. Next.js API routes are HTTP-only.',
    endpoints: {
      websocket: '/api/iot/websocket',
      sse: '/api/iot/sse',
      deviceData: '/api/iot/device-data'
    }
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// POST: Send command to device via WebSocket (if server is running)
export async function POST(request) {
  try {
    const { deviceId, command, parameters } = await request.json();

    if (!deviceId || !command) {
      return NextResponse.json(
        { error: 'Device ID and command are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would communicate with the WebSocket server
    // For now, we'll store the command in the database and the WebSocket server can pick it up
    const { db } = await connectToDatabase();
    
    const commandDoc = {
      deviceId,
      command,
      parameters: parameters || {},
      status: 'pending',
      createdAt: new Date(),
      source: 'api'
    };

    await db.collection('control_commands').insertOne(commandDoc);

    // Broadcast to WebSocket connections if server is running
    // This would typically be done via a shared message queue or Redis pub/sub
    broadcastToDevice(deviceId, {
      type: 'command',
      command,
      parameters: parameters || {},
      commandId: commandDoc._id
    });

    return NextResponse.json({
      message: 'Command queued successfully',
      commandId: commandDoc._id,
      deviceId,
      command
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending WebSocket command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
      if (connection.readyState === 1) { // WebSocket.OPEN
        connection.send(message);
      }
    } catch (error) {
      console.error(`Error broadcasting to device ${deviceId}:`, error);
      connections.delete(deviceId);
    }
  });
}

// Function to send message to specific device
export function sendToDevice(deviceId, data) {
  const connection = connections.get(deviceId);
  if (connection && connection.readyState === 1) { // WebSocket.OPEN
    try {
      const message = JSON.stringify({
        type: 'device_message',
        data,
        timestamp: new Date().toISOString()
      });
      connection.send(message);
      return true;
    } catch (error) {
      console.error(`Error sending to device ${deviceId}:`, error);
      connections.delete(deviceId);
      return false;
    }
  }
  return false;
}

// Function to broadcast to device (used by POST endpoint)
function broadcastToDevice(deviceId, data) {
  // This would typically communicate with the WebSocket server process
  // For now, it's a placeholder that logs the action
  console.log(`📤 Would send to device ${deviceId}:`, data);
  
  // In production, you might use:
  // - Redis pub/sub
  // - Message queue (RabbitMQ, etc.)
  // - Shared memory/event emitter
  // - HTTP call to WebSocket server management endpoint
}
