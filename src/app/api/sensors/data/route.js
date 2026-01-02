import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { checkAutomationRules } from '../../../../lib/automation-rules';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// ESP32 device authentication (using MAC address + device key)
function verifyDeviceAuth(request) {
  const deviceKey = request.headers.get('x-device-key');
  const macAddress = request.headers.get('x-device-mac');
  
  if (!deviceKey || !macAddress) {
    throw new Error('Device authentication required');
  }
  
  // In production, verify device key against database
  // For now, simple validation
  return { macAddress, deviceKey };
}

// User JWT authentication
function verifyUserToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// POST: ESP32 devices send sensor data
export async function POST(request) {
  try {
    const deviceAuth = verifyDeviceAuth(request);
    const { macAddress } = deviceAuth;

    const sensorData = await request.json();
    
    // Validate sensor data structure
    const requiredFields = ['timestamp', 'sensors'];
    for (const field of requiredFields) {
      if (!sensorData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const sensorDataCollection = db.collection('sensor_readings');

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

    // Prepare sensor readings for database
    const readings = [];
    const { sensors } = sensorData;

    // Process each sensor type
    if (sensors.soilMoisture !== undefined) {
      readings.push({
        deviceId: device._id,
        timestamp: new Date(sensorData.timestamp),
        sensorType: 'soil_moisture',
        value: sensors.soilMoisture,
        unit: 'percentage',
        rawValue: sensors.soilMoistureRaw || sensors.soilMoisture
      });
    }

    if (sensors.temperature !== undefined) {
      readings.push({
        deviceId: device._id,
        timestamp: new Date(sensorData.timestamp),
        sensorType: 'temperature',
        value: sensors.temperature,
        unit: 'celsius',
        rawValue: sensors.temperature
      });
    }

    if (sensors.humidity !== undefined) {
      readings.push({
        deviceId: device._id,
        timestamp: new Date(sensorData.timestamp),
        sensorType: 'humidity',
        value: sensors.humidity,
        unit: 'percentage',
        rawValue: sensors.humidity
      });
    }

    if (sensors.lightLevel !== undefined) {
      readings.push({
        deviceId: device._id,
        timestamp: new Date(sensorData.timestamp),
        sensorType: 'light_level',
        value: sensors.lightLevel,
        unit: 'lux',
        rawValue: sensors.lightLevelRaw || sensors.lightLevel
      });
    }

    // Battery level (if provided)
    if (sensors.batteryLevel !== undefined) {
      readings.push({
        deviceId: device._id,
        timestamp: new Date(sensorData.timestamp),
        sensorType: 'battery_level',
        value: sensors.batteryLevel,
        unit: 'percentage',
        rawValue: sensors.batteryLevel
      });
    }

    // Insert sensor readings
    if (readings.length > 0) {
      await sensorDataCollection.insertMany(readings);
    }

    // Update device status and last seen
    await devicesCollection.updateOne(
      { _id: device._id },
      { 
        $set: { 
          status: 'online',
          lastSeen: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Check for automation rules and execute actions
    try {
      const automationResult = await checkAutomationRules(device._id, readings);
      if (automationResult.triggered) {
        console.log('Automation rules triggered:', automationResult.actions);
      }
    } catch (automationError) {
      console.error('Error checking automation rules:', automationError);
      // Don't fail the sensor data insertion if automation check fails
    }

    return NextResponse.json({
      message: 'Sensor data received successfully',
      readingsCount: readings.length
    }, { status: 200 });

  } catch (error) {
    console.error('Sensor data error:', error);
    
    if (error.message === 'Device authentication required') {
      return NextResponse.json(
        { error: 'Device authentication required' },
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

// GET: Users fetch sensor data for their devices
export async function GET(request) {
  try {
    const decoded = verifyUserToken(request);
    const userId = decoded.userId;

    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sensorType = url.searchParams.get('sensorType');
    const limit = parseInt(url.searchParams.get('limit')) || 100;

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const sensorDataCollection = db.collection('sensor_readings');

    // Build query
    let query = {};
    
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
    } else {
      // Get all user's devices
      const userDevices = await devicesCollection.find(
        { userId: new ObjectId(userId) },
        { projection: { _id: 1 } }
      ).toArray();
      
      query.deviceId = { $in: userDevices.map(d => d._id) };
    }

    // Add time range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Add sensor type filter
    if (sensorType) {
      query.sensorType = sensorType;
    }

    // Fetch sensor readings
    const readings = await sensorDataCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    // Get latest readings summary
    const latestReadings = await sensorDataCollection.aggregate([
      { $match: query },
      { $sort: { timestamp: -1 } },
      { 
        $group: {
          _id: { deviceId: '$deviceId', sensorType: '$sensorType' },
          latestValue: { $first: '$value' },
          latestTimestamp: { $first: '$timestamp' },
          unit: { $first: '$unit' }
        }
      }
    ]).toArray();

    return NextResponse.json({
      readings,
      latestReadings,
      totalCount: readings.length
    }, { status: 200 });

  } catch (error) {
    console.error('Get sensor data error:', error);
    
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
