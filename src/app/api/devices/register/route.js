import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Middleware to verify JWT token
function verifyToken(request) {
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

export async function POST(request) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const { deviceName, macAddress, deviceType, location } = await request.json();

    // Validate input
    if (!deviceName || !macAddress || !deviceType) {
      return NextResponse.json(
        { error: 'Device name, MAC address, and device type are required' },
        { status: 400 }
      );
    }

    // Validate MAC address format
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
      return NextResponse.json(
        { error: 'Invalid MAC address format' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const usersCollection = db.collection('users');

    // Check if device already exists
    const existingDevice = await devicesCollection.findOne({ macAddress });
    if (existingDevice) {
      return NextResponse.json(
        { error: 'Device with this MAC address already registered' },
        { status: 409 }
      );
    }

    // Create new device
    const newDevice = {
      userId: new ObjectId(userId),
      deviceName,
      macAddress: macAddress.toUpperCase(),
      deviceType,
      location: location || 'Garden',
      status: 'offline',
      firmwareVersion: '1.0.0',
      lastSeen: null,
      sensors: {
        soilMoisture: { enabled: true, calibration: { min: 0, max: 1024 } },
        temperature: { enabled: true, calibration: { offset: 0 } },
        humidity: { enabled: true, calibration: { offset: 0 } },
        lightLevel: { enabled: true, calibration: { min: 0, max: 1024 } }
      },
      actuators: {
        waterPump: { enabled: true, settings: { maxDuration: 300 } },
        ledLights: { enabled: true, settings: { brightness: 80 } }
      },
      automationRules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await devicesCollection.insertOne(newDevice);

    // Add device to user's device list
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $push: { devices: result.insertedId },
        $set: { updatedAt: new Date() }
      }
    );

    // Return device data
    const deviceResponse = {
      id: result.insertedId,
      deviceName,
      macAddress: macAddress.toUpperCase(),
      deviceType,
      location,
      status: 'offline'
    };

    return NextResponse.json({
      message: 'Device registered successfully',
      device: deviceResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Device registration error:', error);
    
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

export async function GET(request) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');

    // Get user's devices
    const devices = await devicesCollection.find(
      { userId: new ObjectId(userId) },
      { 
        projection: { 
          deviceName: 1, 
          macAddress: 1, 
          deviceType: 1, 
          location: 1, 
          status: 1, 
          lastSeen: 1,
          firmwareVersion: 1
        } 
      }
    ).toArray();

    return NextResponse.json({
      devices
    }, { status: 200 });

  } catch (error) {
    console.error('Get devices error:', error);
    
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
