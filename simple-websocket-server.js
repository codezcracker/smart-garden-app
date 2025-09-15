const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all interfaces
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
        console.log('📨 Received message:', message.type);
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

  async function handleWebSocketMessage(ws, message) {
    const { type, deviceId, data, ...otherFields } = message;

    switch (type) {
      case 'device_register':
        await handleDeviceRegister(ws, deviceId, data || otherFields);
        break;
        
      case 'device_data':
        // ESP8266 sends data directly in message, not nested under 'data'
        const deviceDataPayload = data || otherFields;
        await handleDeviceData(ws, deviceId, deviceDataPayload);
        break;
        
      case 'heartbeat':
        await handleHeartbeat(ws, deviceId, data || otherFields);
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
    console.log(`📊 Device data from ${deviceId}:`, JSON.stringify(data, null, 2));
    
    try {
      // Handle data structure safely - data might be nested
      const actualData = data?.data || data; // Handle if data is wrapped in 'data' property
      
      const deviceData = {
        deviceId,
        timestamp: actualData?.timestamp || data?.timestamp || Date.now(),
        sensors: actualData?.sensors || data?.sensors || {},
        system: actualData?.system || data?.system || {},
        receivedAt: new Date(),
        dataType: 'device_data'
      };
      
      console.log(`✅ Processed device data:`, JSON.stringify(deviceData, null, 2));
      
      // Broadcast to dashboard clients
      broadcastToDashboard({
        type: 'device_data',
        data: deviceData,
        timestamp: new Date().toISOString()
      });

      // Send acknowledgment to ESP8266
      ws.send(JSON.stringify({
        type: 'data_received',
        deviceId,
        timestamp: new Date().toISOString(),
        status: 'success'
      }));
      
    } catch (error) {
      console.error(`❌ Error processing device data from ${deviceId}:`, error);
      console.error(`❌ Raw data:`, data);
      
      // Still send acknowledgment to prevent ESP8266 from disconnecting
      ws.send(JSON.stringify({
        type: 'data_received',
        deviceId,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error.message
      }));
    }
  }

  async function handleHeartbeat(ws, deviceId, data) {
    console.log(`💓 Heartbeat from ${deviceId}`);
    
    ws.send(JSON.stringify({
      type: 'heartbeat_ack',
      deviceId,
      timestamp: new Date().toISOString()
    }));
  }

  function handleDashboardConnect(ws) {
    console.log('📊 Dashboard connected');
    dashboardClients.add(ws);
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
        console.log(`📱 Device offline: ${deviceId}`);
        
        // Notify dashboard clients
        broadcastToDashboard({
          type: 'device_offline',
          deviceId,
          timestamp: new Date().toISOString()
        });
        break;
      }
    }
    
    // Remove from dashboard clients
    dashboardClients.delete(ws);
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/api/iot/websocket`);
  });
});
