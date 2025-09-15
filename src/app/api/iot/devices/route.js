import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/iot/devices - Get all devices
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all devices from the devices collection
    const devices = await db.collection('devices').find({}).toArray();
    
    // Also get latest status from device_data collection
    const deviceStatuses = await db.collection('device_data').aggregate([
      {
        $group: {
          _id: '$deviceId',
          lastSeen: { $max: '$timestamp' },
          latestData: { $first: '$$ROOT' }
        }
      }
    ]).toArray();
    
    // Merge device config with status data
    const devicesWithStatus = devices.map(device => {
      const statusData = deviceStatuses.find(s => s._id === device.deviceId);
      return {
        ...device,
        lastSeen: statusData?.lastSeen || null,
        wifiRSSI: statusData?.latestData?.wifiRSSI || null,
        status: statusData ? 'online' : 'offline'
      };
    });
    
    console.log('📱 Devices API: Retrieved', devicesWithStatus.length, 'devices');
    
    return NextResponse.json({
      success: true,
      devices: devicesWithStatus
    });
    
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch devices'
    }, { status: 500 });
  }
}

// POST /api/iot/devices - Create or update a device
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const deviceData = await request.json();
    
    // Validate required fields
    if (!deviceData.deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Prepare device document
    const deviceDocument = {
      deviceId: deviceData.deviceId,
      deviceName: deviceData.deviceName || deviceData.deviceId,
      location: deviceData.location || '',
      description: deviceData.description || '',
      wifiSSID: deviceData.wifiSSID || '',
      wifiPassword: deviceData.wifiPassword || '',
      sensors: deviceData.sensors || {
        temperature: true,
        humidity: true,
        lightLevel: true,
        soilMoisture: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Upsert device (create or update)
    const result = await db.collection('devices').replaceOne(
      { deviceId: deviceData.deviceId },
      deviceDocument,
      { upsert: true }
    );
    
    console.log('📱 Devices API: Device saved:', deviceData.deviceId);
    console.log('📊 Device Data:', {
      deviceId: deviceData.deviceId,
      deviceName: deviceDocument.deviceName,
      location: deviceDocument.location,
      sensors: deviceDocument.sensors
    });
    
    return NextResponse.json({
      success: true,
      message: 'Device configuration saved successfully',
      device: deviceDocument
    });
    
  } catch (error) {
    console.error('❌ Error saving device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save device configuration'
    }, { status: 500 });
  }
}
