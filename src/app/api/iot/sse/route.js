import { NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

// Store active connections
const connections = new Set();

export async function GET(request) {
  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the set
      const connection = { controller, id: Date.now() };
      connections.add(connection);
      
      console.log(`📡 SSE connection opened. Total connections: ${connections.size}`);
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connection',
        message: 'Connected to real-time data stream',
        timestamp: new Date().toISOString()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      
      // Send initial device data
      sendInitialData(controller);
      
      // Set up periodic data updates
      const interval = setInterval(async () => {
        try {
          await sendLatestData(controller);
        } catch (error) {
          console.error('Error sending SSE data:', error);
          clearInterval(interval);
          connections.delete(connection);
        }
      }, 5000); // Send data every 5 seconds
      
      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        connections.delete(connection);
        console.log(`📡 SSE connection closed. Total connections: ${connections.size}`);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

async function sendInitialData(controller) {
  try {
    const { db } = await connectToDatabase();
    
    // Get latest device data
    const latestData = await db.collection('iot_device_data')
      .find({})
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    if (latestData.length > 0) {
      const data = JSON.stringify({
        type: 'device_data',
        data: latestData[0],
        timestamp: new Date().toISOString()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
    }
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}

async function sendLatestData(controller) {
  try {
    const { db } = await connectToDatabase();
    
    // Check for offline devices first
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    await db.collection('iot_devices').updateMany(
      { 
        lastSeen: { $lt: thirtySecondsAgo },
        status: 'online'
      },
      { 
        $set: { 
          status: 'offline',
          lastOffline: new Date()
        }
      }
    );
    
    // Get latest device data
    const latestData = await db.collection('iot_device_data')
      .find({})
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    // Get device status
    const deviceStatus = await db.collection('iot_devices')
      .findOne({}, { sort: { lastSeen: -1 } });

    if (latestData.length > 0 && deviceStatus) {
      // Check if device is offline
      const isOffline = deviceStatus.status === 'offline';
      const timeSinceLastSeen = Date.now() - new Date(deviceStatus.lastSeen).getTime();
      
      if (isOffline) {
        // Send offline status instead of cached data
        const data = JSON.stringify({
          type: 'device_offline',
          message: 'Device is offline',
          lastSeen: deviceStatus.lastSeen,
          timeSinceLastSeen: timeSinceLastSeen,
          timestamp: new Date().toISOString()
        });
        
        controller.enqueue(`data: ${data}\n\n`);
      } else {
        // Device is online, send latest data
        const data = JSON.stringify({
          type: 'device_data',
          data: latestData[0],
          timestamp: new Date().toISOString()
        });
        
        controller.enqueue(`data: ${data}\n\n`);
      }
    }
  } catch (error) {
    console.error('Error sending latest data:', error);
  }
}

// Function to broadcast to all connections (can be called from other parts of the app)
export function broadcastToAllConnections(data) {
  const message = JSON.stringify({
    type: 'broadcast',
    data,
    timestamp: new Date().toISOString()
  });
  
  connections.forEach(connection => {
    try {
      connection.controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      console.error('Error broadcasting to connection:', error);
      connections.delete(connection);
    }
  });
}
