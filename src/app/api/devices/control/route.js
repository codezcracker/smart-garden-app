import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// User JWT authentication
function verifyUserToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// POST: Send control commands to ESP32 devices
export async function POST(request) {
  try {
    const decoded = verifyUserToken(request);
    const userId = decoded.userId;

    const { deviceId, action, parameters } = await request.json();

    // Validate input
    if (!deviceId || !action) {
      return NextResponse.json(
        { error: 'Device ID and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['water', 'light_on', 'light_off', 'set_light_brightness', 'get_status'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Valid actions: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smart_garden_iot');
    const devicesCollection = db.collection('devices');
    const commandsCollection = db.collection('control_commands');

    // Verify user owns this device
    const device = await devicesCollection.findOne({
      _id: new ObjectId(deviceId),
      userId: new ObjectId(userId)
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found or access denied' },
        { status: 404 }
      );
    }

    // Check if device is online
    if (device.status !== 'online') {
      return NextResponse.json(
        { error: 'Device is offline' },
        { status: 400 }
      );
    }

    // Validate action-specific parameters
    let validatedParams = {};
    
    switch (action) {
      case 'water':
        const duration = parameters?.duration || 30; // Default 30 seconds
        if (duration < 1 || duration > 300) { // Max 5 minutes
          return NextResponse.json(
            { error: 'Water duration must be between 1 and 300 seconds' },
            { status: 400 }
          );
        }
        validatedParams = { duration };
        break;
        
      case 'set_light_brightness':
        const brightness = parameters?.brightness;
        if (brightness === undefined || brightness < 0 || brightness > 100) {
          return NextResponse.json(
            { error: 'Brightness must be between 0 and 100' },
            { status: 400 }
          );
        }
        validatedParams = { brightness };
        break;
        
      case 'light_on':
        validatedParams = { brightness: parameters?.brightness || 80 };
        break;
        
      case 'light_off':
      case 'get_status':
        validatedParams = {};
        break;
    }

    // Create control command
    const command = {
      deviceId: new ObjectId(deviceId),
      userId: new ObjectId(userId),
      action,
      parameters: validatedParams,
      status: 'pending',
      createdAt: new Date(),
      sentAt: null,
      completedAt: null,
      response: null
    };

    const result = await commandsCollection.insertOne(command);

    // In a real system, you would:
    // 1. Send command via MQTT to device
    // 2. Wait for acknowledgment
    // 3. Update command status
    
    // For now, simulate command being sent
    await commandsCollection.updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          status: 'sent',
          sentAt: new Date()
        }
      }
    );

    // Log the action
    console.log(`Control command sent - Device: ${deviceId}, Action: ${action}, Params:`, validatedParams);

    return NextResponse.json({
      message: 'Control command sent successfully',
      commandId: result.insertedId,
      action,
      parameters: validatedParams
    }, { status: 200 });

  } catch (error) {
    console.error('Device control error:', error);
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// GET: Get command history for devices
export async function GET(request) {
  try {
    const decoded = verifyUserToken(request);
    const userId = decoded.userId;

    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    await client.connect();
    const db = client.db('smart_garden_iot');
    const devicesCollection = db.collection('devices');
    const commandsCollection = db.collection('control_commands');

    let query = { userId: new ObjectId(userId) };

    if (deviceId) {
      // Verify user owns this device
      const device = await devicesCollection.findOne({
        _id: new ObjectId(deviceId),
        userId: new ObjectId(userId)
      });
      
      if (!device) {
        return NextResponse.json(
          { error: 'Device not found or access denied' },
          { status: 404 }
        );
      }
      
      query.deviceId = new ObjectId(deviceId);
    }

    // Fetch command history
    const commands = await commandsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      commands
    }, { status: 200 });

  } catch (error) {
    console.error('Get commands error:', error);
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// ESP32 devices can poll for pending commands
export async function PATCH(request) {
  try {
    // Device authentication
    const deviceKey = request.headers.get('x-device-key');
    const macAddress = request.headers.get('x-device-mac');
    
    if (!deviceKey || !macAddress) {
      return NextResponse.json(
        { error: 'Device authentication required' },
        { status: 401 }
      );
    }

    await client.connect();
    const db = client.db('smart_garden_iot');
    const devicesCollection = db.collection('devices');
    const commandsCollection = db.collection('control_commands');

    // Find device by MAC address
    const device = await devicesCollection.findOne({ 
      macAddress: macAddress.toUpperCase() 
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Get pending commands for this device
    const pendingCommands = await commandsCollection
      .find({
        deviceId: device._id,
        status: { $in: ['pending', 'sent'] }
      })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark commands as delivered
    if (pendingCommands.length > 0) {
      const commandIds = pendingCommands.map(cmd => cmd._id);
      await commandsCollection.updateMany(
        { _id: { $in: commandIds } },
        { 
          $set: { 
            status: 'delivered',
            deliveredAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      commands: pendingCommands.map(cmd => ({
        id: cmd._id,
        action: cmd.action,
        parameters: cmd.parameters,
        createdAt: cmd.createdAt
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Device poll error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
