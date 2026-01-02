import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('📊 Sensor Data API: Received sensor data');
    
    const data = await request.json();
    console.log('📊 Data:', {
      deviceId: data.deviceId,
      temperature: data.temperature,
      humidity: data.humidity,
      soilMoisture: data.soilMoisture,
      lightLevel: data.lightLevel
    });

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Add received timestamp and status
    data.receivedAt = new Date();
    data.dataType = 'sensor_reading';
    data.status = 'online'; // Device is online if sending data
    
    // Store sensor data
    await db.collection('iot_device_data').insertOne(data);

    // Update device status in both collections
    const updateData = {
      deviceId: data.deviceId,
      lastSeen: new Date(),
      status: 'online',
      wifiRSSI: data.wifiRSSI || 0,
      temperature: data.temperature,
      humidity: data.humidity,
      soilMoisture: data.soilMoisture,
      lightLevel: data.lightLevel,
      updatedAt: new Date()
    };

    // Update iot_devices collection
    await db.collection('iot_devices').updateOne(
      { deviceId: data.deviceId },
      { $set: updateData },
      { upsert: true }
    );

    // Also update user_devices collection if device exists
    const userDeviceUpdate = await db.collection('user_devices').updateOne(
      { deviceId: data.deviceId },
      { $set: updateData },
      { upsert: false } // Don't create if doesn't exist
    );

    if (userDeviceUpdate.modifiedCount > 0) {
      console.log('✅ Updated user_devices collection for', data.deviceId);
    }

    console.log('✅ Sensor data stored for device:', data.deviceId);

    return NextResponse.json({ 
      success: true, 
      message: 'Sensor data received successfully',
      deviceId: data.deviceId
    });

  } catch (error) {
    console.error('❌ Sensor Data API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process sensor data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get recent sensor data
    const sensorData = await db.collection('iot_device_data')
      .find({})
      .sort({ receivedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      data: sensorData,
      count: sensorData.length
    });

  } catch (error) {
    console.error('❌ Sensor Data GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}

