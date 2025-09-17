import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/iot/user-devices - Get devices for authenticated user
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get user ID from request headers (set by auth middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get devices belonging to this user
    const devices = await db.collection('user_devices').find({ userId }).toArray();
    
    // Get latest data for each device
    const devicesWithData = await Promise.all(
      devices.map(async (device) => {
        const latestData = await db.collection('device_data')
          .findOne({ deviceId: device.deviceId }, { sort: { timestamp: -1 } });
        
        return {
          ...device,
          lastSeen: latestData?.timestamp || null,
          wifiRSSI: latestData?.wifiRSSI || null,
          status: latestData ? 'online' : 'offline',
          latestData: latestData || null
        };
      })
    );
    
    console.log('📱 User Devices API: Retrieved', devicesWithData.length, 'devices for user', userId);
    
    return NextResponse.json({
      success: true,
      devices: devicesWithData
    });
    
  } catch (error) {
    console.error('❌ Error fetching user devices:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user devices'
    }, { status: 500 });
  }
}

// POST /api/iot/user-devices - Create new device for authenticated user
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const deviceData = await request.json();
    
    // Validate required fields
    if (!deviceData.deviceId || !deviceData.deviceName) {
      return NextResponse.json({
        success: false,
        error: 'Device ID and Device Name are required'
      }, { status: 400 });
    }
    
    // Check if device ID already exists for any user
    const existingDevice = await db.collection('user_devices').findOne({ deviceId: deviceData.deviceId });
    if (existingDevice) {
      return NextResponse.json({
        success: false,
        error: 'Device ID already exists'
      }, { status: 409 });
    }
    
    // Create device document
    const deviceDocument = {
      userId: userId,
      deviceId: deviceData.deviceId,
      deviceName: deviceData.deviceName,
      deviceType: deviceData.deviceType || 'ESP8266',
      location: deviceData.location || '',
      description: deviceData.description || '',
      
      // Network configuration
      network: {
        wifiSSID: deviceData.wifiSSID || '',
        wifiPassword: deviceData.wifiPassword || '',
        serverURL: deviceData.serverURL || 'http://192.168.68.58:3000',
        backupServerURL: deviceData.backupServerURL || 'https://smart-garden-q37q6fr40-codezs-projects.vercel.app'
      },
      
      // Sensor configuration
      sensors: {
        temperature: {
          enabled: deviceData.temperatureEnabled !== false,
          calibration: deviceData.temperatureCalibration || { offset: 0, scale: 1 }
        },
        humidity: {
          enabled: deviceData.humidityEnabled !== false,
          calibration: deviceData.humidityCalibration || { offset: 0, scale: 1 }
        },
        lightLevel: {
          enabled: deviceData.lightLevelEnabled !== false,
          calibration: deviceData.lightLevelCalibration || { min: 0, max: 1024 }
        },
        soilMoisture: {
          enabled: deviceData.soilMoistureEnabled !== false,
          calibration: deviceData.soilMoistureCalibration || { min: 0, max: 1024 }
        }
      },
      
      // Device settings
      settings: {
        sendInterval: deviceData.sendInterval || 1000,
        reconnectAttempts: deviceData.reconnectAttempts || 3,
        timeout: deviceData.timeout || 5000,
        deepSleepEnabled: deviceData.deepSleepEnabled || false,
        deepSleepDuration: deviceData.deepSleepDuration || 300000 // 5 minutes
      },
      
      // Status and metadata
      status: 'inactive',
      firmwareVersion: deviceData.firmwareVersion || '1.0.0',
      lastConfigUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert device
    const result = await db.collection('user_devices').insertOne(deviceDocument);
    
    console.log('📱 User Devices API: Created device', deviceData.deviceId, 'for user', userId);
    
    return NextResponse.json({
      success: true,
      message: 'Device created successfully',
      device: {
        _id: result.insertedId,
        deviceId: deviceData.deviceId,
        deviceName: deviceData.deviceName,
        status: 'inactive'
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create device'
    }, { status: 500 });
  }
}
