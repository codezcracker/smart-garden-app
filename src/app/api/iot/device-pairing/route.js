import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const data = await request.json();
    const { discoveryId, deviceId, deviceName, userId = 'demo-user-123' } = data;
    
    const { db } = await connectToDatabase();
    
    // Check if device is in discovery mode
    const discoveryDevice = await db.collection('device_discovery').findOne({
      id: discoveryId,
      status: 'discovery'
    });
    
    if (!discoveryDevice) {
      return NextResponse.json(
        { success: false, error: 'Device not found in discovery mode' },
        { status: 404 }
      );
    }
    
    // Create the paired device
    const pairedDevice = {
      userId: userId,
      deviceId: deviceId,
      deviceName: deviceName,
      serialNumber: discoveryDevice.serialNumber,
      deviceType: discoveryDevice.deviceType,
      status: 'offline',
      location: 'Not set',
      description: '',
      gardenId: null,
      sensors: {
        temperature: true,
        humidity: true,
        soilMoisture: true,
        light: true
      },
      settings: {
        dataInterval: 30,
        alertThresholds: {
          temperature: { min: 10, max: 35 },
          humidity: { min: 30, max: 80 },
          soilMoisture: { min: 20, max: 80 },
          light: { min: 100, max: 1000 }
        }
      },
      firmwareVersion: '1.0.0',
      createdAt: new Date(),
      lastSeen: null
    };
    
    // Save the paired device
    await db.collection('user_devices').insertOne(pairedDevice);
    
    // Update discovery device to paired status
    await db.collection('device_discovery').updateOne(
      { id: discoveryId },
      { 
        $set: {
          status: 'paired',
          userId: userId,
          deviceId: deviceId,
          pairedAt: new Date()
        }
      }
    );
    
    console.log('🔗 Device paired successfully:', { discoveryId, deviceId, deviceName });
    
    return NextResponse.json({
      success: true,
      message: 'Device paired successfully',
      device: pairedDevice,
      deviceId: deviceId,
      paired: true
    });
    
  } catch (error) {
    console.error('❌ Device pairing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to pair device' },
      { status: 500 }
    );
  }
}
