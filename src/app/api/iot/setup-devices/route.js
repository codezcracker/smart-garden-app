import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/iot/setup-devices - Setup initial device configurations
export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    // Create initial device configuration for DB007
    const db007Device = {
      deviceId: 'DB007',
      deviceName: 'Garden Sensor 1',
      location: 'Living Room',
      description: 'Main garden sensor monitoring temperature, humidity, light, and soil moisture',
      wifiSSID: 'Qureshi Deco',
      wifiPassword: '65327050',
      sensors: {
        temperature: true,
        humidity: true,
        lightLevel: true,
        soilMoisture: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert or update the device configuration
    const result = await db.collection('devices').replaceOne(
      { deviceId: 'DB007' },
      db007Device,
      { upsert: true }
    );
    
    console.log('🔧 Setup Devices: Created/updated DB007 device configuration');
    
    // Get all devices to return
    const devices = await db.collection('devices').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Device configurations setup successfully',
      devices: devices,
      operation: result.upsertedId ? 'created' : 'updated'
    });
    
  } catch (error) {
    console.error('❌ Error setting up devices:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup device configurations'
    }, { status: 500 });
  }
}
