const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
// MongoDB connection will be handled in API routes

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store WebSocket connections
const clients = new Map(); // deviceId -> WebSocket
const dashboardClients = new Set(); // Dashboard connections

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create WebSocket server
  const wss = new WebSocket.Server({ 
    server,
    path: '/api/iot/websocket'
  });

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      removeClient(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Smart Garden WebSocket',
      timestamp: new Date().toISOString()
    }));
  });

  // Start heartbeat to check for offline devices
  setInterval(async () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    
    try {
      const { db } = await connectToDatabase();
      
      // Mark devices as offline if they haven't been seen recently
      const result = await db.collection('iot_devices').updateMany(
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

      if (result.modifiedCount > 0) {
        console.log(`🔄 Marked ${result.modifiedCount} devices as offline`);
        
        // Notify dashboard clients
        broadcastToDashboard({
          type: 'devices_offline',
          count: result.modifiedCount,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in heartbeat check:', error);
    }
  }, 10000); // Check every 10 seconds

  async function handleWebSocketMessage(ws, message) {
    const { type, deviceId, data } = message;

    switch (type) {
      case 'device_register':
        await handleDeviceRegister(ws, deviceId, data);
        break;
        
      case 'device_data':
        await handleDeviceData(ws, deviceId, data);
        break;
        
      case 'heartbeat':
        await handleHeartbeat(ws, deviceId, data);
        break;
        
      case 'dashboard_connect':
        handleDashboardConnect(ws);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
        
      default:
        console.log('❓ Unknown message type:', type);
    }
  }

  async function handleDeviceRegister(ws, deviceId, data) {
    console.log(`📱 Device registered: ${deviceId}`);
    
    // Store device connection
    clients.set(deviceId, ws);
    
    // Update device status in database
    const { db } = await connectToDatabase();
    await db.collection('iot_devices').updateOne(
      { deviceId },
      {
        $set: {
          deviceId,
          status: 'online',
          lastSeen: new Date(),
          ...data
        }
      },
      { upsert: true }
    );

    // Notify dashboard clients
    broadcastToDashboard({
      type: 'device_online',
      deviceId,
      timestamp: new Date().toISOString()
    });

    ws.send(JSON.stringify({
      type: 'registration_success',
      deviceId,
      message: 'Device registered successfully'
    }));
  }

  async function handleDeviceData(ws, deviceId, data) {
    console.log(`📊 Device data from ${deviceId}:`, data);
    
    // Store data in database
    const { db } = await connectToDatabase();
    const dataToStore = {
      deviceId,
      timestamp: data.timestamp || Date.now(),
      sensors: data.sensors || {},
      system: data.system || {},
      receivedAt: new Date(),
      dataType: 'device_data'
    };

    await db.collection('iot_device_data').insertOne(dataToStore);

    // Update device status
    await db.collection('iot_devices').updateOne(
      { deviceId },
      {
        $set: {
          deviceId,
          status: 'online',
          lastSeen: new Date(),
          ...data
        }
      },
      { upsert: true }
    );

    // Broadcast to dashboard clients
    broadcastToDashboard({
      type: 'device_data',
      data: dataToStore,
      timestamp: new Date().toISOString()
    });

    ws.send(JSON.stringify({
      type: 'data_received',
      deviceId,
      timestamp: new Date().toISOString()
    }));
  }

  async function handleHeartbeat(ws, deviceId, data) {
    console.log(`💓 Heartbeat from ${deviceId}`);
    
    // Update device status
    const { db } = await connectToDatabase();
    await db.collection('iot_devices').updateOne(
      { deviceId },
      {
        $set: {
          deviceId,
          status: 'online',
          lastSeen: new Date(),
          lastHeartbeat: new Date(),
          ...data
        }
      },
      { upsert: true }
    );

    ws.send(JSON.stringify({
      type: 'heartbeat_ack',
      deviceId,
      timestamp: new Date().toISOString()
    }));
  }

  function handleDashboardConnect(ws) {
    console.log('📊 Dashboard connected');
    dashboardClients.add(ws);
    
    // Send current device status
    sendCurrentDeviceStatus(ws);
  }

  async function sendCurrentDeviceStatus(ws) {
    try {
      const { db } = await connectToDatabase();
      
      // Get latest device data
      const latestData = await db.collection('iot_device_data')
        .find({})
        .sort({ receivedAt: -1 })
        .limit(1)
        .toArray();

      if (latestData.length > 0) {
        ws.send(JSON.stringify({
          type: 'device_data',
          data: latestData[0],
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error sending current device status:', error);
    }
  }

  function broadcastToDashboard(message) {
    dashboardClients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  function removeClient(ws) {
    // Remove from device clients
    for (const [deviceId, clientWs] of clients.entries()) {
      if (clientWs === ws) {
        clients.delete(deviceId);
        markDeviceOffline(deviceId);
        break;
      }
    }
    
    // Remove from dashboard clients
    dashboardClients.delete(ws);
  }

  async function markDeviceOffline(deviceId) {
    console.log(`📱 Device offline: ${deviceId}`);
    
    try {
      const { db } = await connectToDatabase();
      await db.collection('iot_devices').updateOne(
        { deviceId },
        {
          $set: {
            status: 'offline',
            lastOffline: new Date()
          }
        }
      );

      // Notify dashboard clients
      broadcastToDashboard({
        type: 'device_offline',
        deviceId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking device offline:', error);
    }
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/api/iot/websocket`);
  });
});
