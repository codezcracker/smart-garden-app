import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get only devices that are in discovery mode (not yet paired)
    const discoveryDevices = await db.collection('device_discovery').find({
      status: 'discovery',
      timestamp: { $gte: new Date(Date.now() - 30000) } // Only devices seen in last 30 seconds
    }).toArray();
    
    // Get count of paired devices for summary
    const pairedCount = await db.collection('device_discovery').countDocuments({
      status: 'paired',
      timestamp: { $gte: new Date(Date.now() - 30000) }
    });
    
    console.log('🔍 Discovery scan found devices:', {
      discovery: discoveryDevices.length,
      paired: pairedCount
    });
    
    return NextResponse.json({
      success: true,
      devices: discoveryDevices.map(device => ({
        id: device.id,
        serialNumber: device.serialNumber,
        deviceType: device.deviceType,
        lastSeen: device.timestamp,
        signalStrength: device.signalStrength || 'N/A',
        status: 'discovery',
        isPaired: false,
        deviceId: null,
        userId: null
      })),
      summary: {
        total: discoveryDevices.length,
        available: discoveryDevices.length,
        paired: pairedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Device discovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scan for devices' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { id, serialNumber, deviceType, signalStrength } = data;
    
    console.log('📡 Device discovery registration attempt:', { id, serialNumber, deviceType, signalStrength });
    
    const { db } = await connectToDatabase();
    console.log('✅ Database connected successfully');
    
    // Register device in discovery mode
    const result = await db.collection('device_discovery').updateOne(
      { id: id },
      { 
        $set: {
          id: id,
          serialNumber: serialNumber,
          deviceType: deviceType || 'Smart Garden Sensor',
          status: 'discovery',
          signalStrength: signalStrength,
          timestamp: new Date(),
          userId: null, // Not paired yet
          deviceId: null // No assigned ID yet
        }
      },
      { upsert: true }
    );
    
    console.log('📡 Device registration result:', result);
    console.log('📡 Device registered in discovery:', { id, serialNumber });
    
    return NextResponse.json({
      success: true,
      message: 'Device registered for discovery',
      paired: false // Device is in discovery mode, not paired yet
    });
    
  } catch (error) {
    console.error('❌ Device discovery registration error:', error);
    console.error('❌ Error details:', error.message, error.stack);
    return NextResponse.json(
      { success: false, error: 'Failed to register device: ' + error.message },
      { status: 500 }
    );
  }
}
