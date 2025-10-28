import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

// Helper function to determine connection quality
function getConnectionQuality(lastSeen) {
  if (!lastSeen) return 'disconnected';
  
  const now = new Date();
  const timeDiff = now - new Date(lastSeen);
  
  if (timeDiff < 5000) return 'excellent';      // Less than 5 seconds
  if (timeDiff < 10000) return 'good';          // Less than 10 seconds  
  if (timeDiff < 30000) return 'poor';          // Less than 30 seconds
  return 'disconnected';                        // More than 30 seconds
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Check for devices that haven't been seen in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    
    // Mark devices as offline if they haven't been seen recently (both collections)
    const result1 = await db.collection('iot_devices').updateMany(
      { 
        lastSeen: { $lt: thirtySecondsAgo },
        status: 'online'
      },
      { 
        $set: { 
          status: 'offline',
          lastOffline: new Date()
        }
      }
    );
    
    const result2 = await db.collection('user_devices').updateMany(
      { 
        lastSeen: { $lt: thirtySecondsAgo },
        status: 'online'
      },
      { 
        $set: { 
          status: 'offline',
          lastOffline: new Date()
        }
      }
    );
    
    console.log(`🔄 Marked ${result1.modifiedCount + result2.modifiedCount} devices as offline`);
    console.log('📊 Status update results:', {
      iot_devices_modified: result1.modifiedCount,
      user_devices_modified: result2.modifiedCount,
      total_modified: result1.modifiedCount + result2.modifiedCount
    });
    
    // Get current device statuses from both collections
    const devices1 = await db.collection('iot_devices').find({}).toArray();
    const devices2 = await db.collection('user_devices').find({}).toArray();
    
    // Combine and deduplicate devices
    const allDevices = [...devices1];
    devices2.forEach(device2 => {
      if (!allDevices.find(d => d.deviceId === device2.deviceId)) {
        allDevices.push(device2);
      }
    });
    
    const devices = allDevices;
    
    console.log('📱 Returning device statuses:', devices.map(d => ({
      deviceId: d.deviceId,
      status: d.status,
      lastSeen: d.lastSeen
    })));
    
    return NextResponse.json({
      success: true,
      devicesOffline: result1.modifiedCount + result2.modifiedCount,
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
