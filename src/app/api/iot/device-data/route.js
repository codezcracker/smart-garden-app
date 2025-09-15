import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('📡 IoT Device Data API: Received data');
    
    const data = await request.json();
    console.log('📊 Device Data:', {
      deviceId: data.deviceId,
      timestamp: data.timestamp,
      systemActive: data.systemActive,
      wifiConnected: data.wifiConnected,
      sensors: data.sensors
    });

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Add received timestamp
    data.receivedAt = new Date();
    data.dataType = 'device_data';
    
    // Store in database
    const result = await db.collection('iot_device_data').insertOne(data);
    console.log('✅ Device data stored:', result.insertedId);

    // Also update device status with better error handling
    const updateData = {
      deviceId: data.deviceId,
      lastSeen: new Date(),
      status: 'online',
      sensors: data.sensors || {}
    };

    // Add system data if available
    if (data.system) {
      updateData.systemActive = data.system.systemActive;
      updateData.wifiConnected = data.system.wifiConnected;
      updateData.wifiSSID = data.system.wifiSSID;
      updateData.wifiIP = data.system.wifiIP;
      updateData.wifiRSSI = data.system.wifiRSSI;
      updateData.uptime = data.system.uptime;
      updateData.errorCount = data.system.errorCount;
    }

    // Add top-level data if system data is not available
    if (!data.system) {
      updateData.systemActive = data.systemActive;
      updateData.wifiConnected = data.wifiConnected;
      updateData.wifiRSSI = data.wifiRSSI;
      updateData.uptime = data.uptime;
    }

    await db.collection('iot_devices').updateOne(
      { deviceId: data.deviceId },
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Device data received successfully',
      deviceId: data.deviceId,
      timestamp: data.timestamp
    });

  } catch (error) {
    console.error('❌ IoT Device Data API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process device data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get latest device data
    const latestData = await db.collection('iot_device_data')
      .find({})
      .sort({ receivedAt: -1 })
      .limit(10)
      .toArray();

    // Get device status
    const devices = await db.collection('iot_devices')
      .find({})
      .toArray();

    return NextResponse.json({
      success: true,
      latestData,
      devices
    });

  } catch (error) {
    console.error('❌ IoT Device Data GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device data' },
      { status: 500 }
    );
  }
}
