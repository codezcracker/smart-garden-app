import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/iot/setup-sample-device - Create a sample device for testing
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Sample device data
    const sampleDevice = {
      userId: 'demo-user-123', // This should be the actual user ID in production
      deviceId: 'DB007',
      deviceName: 'Smart Garden Sensor 1',
      deviceType: 'ESP8266',
      location: 'Living Room',
      description: 'Main garden sensor monitoring temperature, humidity, light, and soil moisture',
      
      // Network configuration
      network: {
        wifiSSID: 'Qureshi Deco',
        wifiPassword: '65327050',
        serverURL: 'http://192.168.68.58:3000',
        backupServerURL: 'https://smart-garden-app.vercel.app'
      },
      
      // Sensor configuration
      sensors: {
        temperature: {
          enabled: true,
          calibration: { offset: 0, scale: 1 }
        },
        humidity: {
          enabled: true,
          calibration: { offset: 0, scale: 1 }
        },
        lightLevel: {
          enabled: true,
          calibration: { min: 0, max: 1024 }
        },
        soilMoisture: {
          enabled: true,
          calibration: { min: 0, max: 1024 }
        }
      },
      
      // Device settings
      settings: {
        sendInterval: 1000,
        reconnectAttempts: 3,
        timeout: 5000,
        deepSleepEnabled: false,
        deepSleepDuration: 300000 // 5 minutes
      },
      
      // Status and metadata
      status: 'inactive',
      firmwareVersion: '2.0.0',
      configVersion: 1,
      lastConfigUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if device already exists
    const existingDevice = await db.collection('user_devices').findOne({ deviceId: sampleDevice.deviceId });
    
    if (existingDevice) {
      return NextResponse.json({
        success: false,
        message: 'Sample device already exists',
        device: existingDevice
      });
    }
    
    // Insert sample device
    const result = await db.collection('user_devices').insertOne(sampleDevice);
    
    console.log('📱 Setup API: Created sample device', sampleDevice.deviceId, 'for user', sampleDevice.userId);
    
    return NextResponse.json({
      success: true,
      message: 'Sample device created successfully',
      device: {
        _id: result.insertedId,
        deviceId: sampleDevice.deviceId,
        deviceName: sampleDevice.deviceName,
        status: 'inactive'
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating sample device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create sample device'
    }, { status: 500 });
  }
}

// GET /api/iot/setup-sample-device - Check if sample device exists
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    const device = await db.collection('user_devices').findOne({ deviceId: 'DB007' });
    
    if (device) {
      return NextResponse.json({
        success: true,
        exists: true,
        device: {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          status: device.status,
          configVersion: device.configVersion
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Sample device not found'
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking sample device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check sample device'
    }, { status: 500 });
  }
}
