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
    const now = new Date();
    
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
    
    // Mark devices as ONLINE if they have been seen recently (regardless of current status)
    const result3 = await db.collection('iot_devices').updateMany(
      { 
        lastSeen: { $gte: thirtySecondsAgo },
        status: { $ne: 'online' }
      },
      { 
        $set: { 
          status: 'online'
        }
      }
    );
    
    const result4 = await db.collection('user_devices').updateMany(
      { 
        lastSeen: { $gte: thirtySecondsAgo },
        status: { $ne: 'online' }
      },
      { 
        $set: { 
          status: 'online'
        }
      }
    );
    
    console.log(`🔄 Status updates: ${result1.modifiedCount + result2.modifiedCount} marked offline, ${result3.modifiedCount + result4.modifiedCount} marked online`);
    console.log('📊 Status update results:', {
      iot_devices_offline: result1.modifiedCount,
      user_devices_offline: result2.modifiedCount,
      iot_devices_online: result3.modifiedCount,
      user_devices_online: result4.modifiedCount,
      total_offline: result1.modifiedCount + result2.modifiedCount,
      total_online: result3.modifiedCount + result4.modifiedCount
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
    
    // Calculate dynamic status based on lastSeen (more reliable than stored status)
    const devicesWithDynamicStatus = devices.map(device => {
      let dynamicStatus = device.status;
      
      if (device.lastSeen) {
        const timeDiff = now - new Date(device.lastSeen);
        // If lastSeen is within 30 seconds, device is online
        if (timeDiff < 30000) {
          dynamicStatus = 'online';
        } else {
          dynamicStatus = 'offline';
        }
      } else {
        // No lastSeen means offline
        dynamicStatus = 'offline';
      }
      
      return {
        deviceId: device.deviceId,
        status: dynamicStatus, // Use dynamically calculated status
        lastSeen: device.lastSeen,
        lastOffline: device.lastOffline,
        wifiRSSI: device.wifiRSSI,
        uptime: device.uptime,
        connectionQuality: getConnectionQuality(device.lastSeen)
      };
    });
    
    console.log('📱 Returning device statuses:', devicesWithDynamicStatus.map(d => ({
      deviceId: d.deviceId,
      status: d.status,
      lastSeen: d.lastSeen,
      timeDiff: d.lastSeen ? (now - new Date(d.lastSeen)) / 1000 + ' seconds' : 'never'
    })));
    
    return NextResponse.json({
      success: true,
      devicesOffline: result1.modifiedCount + result2.modifiedCount,
      devicesOnline: result3.modifiedCount + result4.modifiedCount,
      devices: devicesWithDynamicStatus
    });

  } catch (error) {
    console.error('❌ Error checking device status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check device status' },
      { status: 500 }
    );
  }
}
