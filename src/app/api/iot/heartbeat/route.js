import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('💓 IoT Heartbeat API: Received heartbeat');
    
    const data = await request.json();
    console.log('💓 Heartbeat Data:', {
      deviceId: data.deviceId,
      status: data.status,
      uptime: data.uptime,
      wifiRSSI: data.wifiRSSI
    });

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Add received timestamp
    data.receivedAt = new Date();
    data.dataType = 'heartbeat';
    
    // Store heartbeat
    await db.collection('iot_heartbeats').insertOne(data);

    // Update device status
    await db.collection('iot_devices').updateOne(
      { deviceId: data.deviceId },
      { 
        $set: {
          deviceId: data.deviceId,
          lastHeartbeat: new Date(),
          status: 'online',
          uptime: data.uptime,
          wifiRSSI: data.wifiRSSI,
          errorCount: data.errorCount
        }
      },
      { upsert: true }
    );

    console.log('✅ Heartbeat processed for device:', data.deviceId);

    return NextResponse.json({ 
      success: true, 
      message: 'Heartbeat received successfully',
      deviceId: data.deviceId
    });

  } catch (error) {
    console.error('❌ IoT Heartbeat API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process heartbeat',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get recent heartbeats
    const heartbeats = await db.collection('iot_heartbeats')
      .find({})
      .sort({ receivedAt: -1 })
      .limit(20)
      .toArray();

    // Get device status
    const devices = await db.collection('iot_devices')
      .find({})
      .toArray();

    return NextResponse.json({
      success: true,
      heartbeats,
      devices
    });

  } catch (error) {
    console.error('❌ IoT Heartbeat GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch heartbeat data' },
      { status: 500 }
    );
  }
}
