import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

// Helper function to determine connection quality
function getConnectionQuality(lastSeen) {
  if (!lastSeen) return 'disconnected';
  
  const now = new Date();
  const timeDiff = now - new Date(lastSeen);
  
  if (timeDiff < 2000) return 'excellent';      // Less than 2 seconds
  if (timeDiff < 4000) return 'good';           // Less than 4 seconds  
  if (timeDiff < 6000) return 'poor';           // Less than 6 seconds
  return 'disconnected';                        // More than 30 seconds
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Check for devices that haven't been seen in the last 4 seconds (stable)
    const fourSecondsAgo = new Date(Date.now() - 4 * 1000);
    
    // Mark devices as offline if they haven't been seen recently
    const result = await db.collection('iot_devices').updateMany(
      { 
        lastSeen: { $lt: fourSecondsAgo },
        status: 'online'
      },
      { 
        $set: { 
          status: 'offline',
          lastOffline: new Date()
        }
      }
    );
    
    console.log(`🔄 Marked ${result.modifiedCount} devices as offline`);
    
    // Get current device statuses
    const devices = await db.collection('iot_devices').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      devicesOffline: result.modifiedCount,
      devices: devices.map(device => ({
        deviceId: device.deviceId,
        status: device.status,
        lastSeen: device.lastSeen,
        lastOffline: device.lastOffline,
        wifiRSSI: device.wifiRSSI,
        uptime: device.uptime,
        connectionQuality: getConnectionQuality(device.lastSeen)
      }))
    });

  } catch (error) {
    console.error('❌ Error checking device status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check device status' },
      { status: 500 }
    );
  }
}
