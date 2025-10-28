import { WebSocketServer } from 'ws';
import { connectToDatabase } from './mongodb';

class SmartGardenWebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // deviceId -> WebSocket
    this.dashboardClients = new Set(); // Dashboard connections
    this.heartbeatInterval = null;
  }

  initialize(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/iot/websocket'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
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
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.removeClient(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Smart Garden WebSocket',
        timestamp: new Date().toISOString()
      }));
    });

    // Start heartbeat to check for offline devices
    this.startHeartbeat();
    
    console.log('✅ WebSocket server initialized');
  }

  async handleMessage(ws, message) {
    const { type, deviceId, data } = message;

    switch (type) {
      case 'device_register':
        await this.handleDeviceRegister(ws, deviceId, data);
        break;
        
      case 'device_data':
        await this.handleDeviceData(ws, deviceId, data);
        break;
        
      case 'heartbeat':
        await this.handleHeartbeat(ws, deviceId, data);
        break;
        
      case 'dashboard_connect':
        this.handleDashboardConnect(ws);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
        
      default:
        console.log('❓ Unknown message type:', type);
    }
  }

  async handleDeviceRegister(ws, deviceId, data) {
    console.log(`📱 Device registered: ${deviceId}`);
    
    // Store device connection
    this.clients.set(deviceId, ws);
    
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
    this.broadcastToDashboard({
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

  async handleDeviceData(ws, deviceId, data) {
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
    this.broadcastToDashboard({
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

  async handleHeartbeat(ws, deviceId, data) {
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

  handleDashboardConnect(ws) {
    console.log('📊 Dashboard connected');
    this.dashboardClients.add(ws);
    
    // Send current device status
    this.sendCurrentDeviceStatus(ws);
  }

  async sendCurrentDeviceStatus(ws) {
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

  broadcastToDashboard(message) {
    this.dashboardClients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  removeClient(ws) {
    // Remove from device clients
    for (const [deviceId, clientWs] of this.clients.entries()) {
      if (clientWs === ws) {
        this.clients.delete(deviceId);
        this.markDeviceOffline(deviceId);
        break;
      }
    }
    
    // Remove from dashboard clients
    this.dashboardClients.delete(ws);
  }

  async markDeviceOffline(deviceId) {
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
      this.broadcastToDashboard({
        type: 'device_offline',
        deviceId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking device offline:', error);
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
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
          this.broadcastToDashboard({
            type: 'devices_offline',
            count: result.modifiedCount,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error in heartbeat check:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Singleton instance
const wsServer = new SmartGardenWebSocketServer();
export default wsServer;


