const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codezcracker:Ars%401234@atlascluster.fs3ipnn.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const MONGODB_DB = 'smartGardenDB';

async function forceDiscoveryMode() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Get all current devices
    const devices = await db.collection('user_devices').find({}).toArray();
    console.log(`📱 Found ${devices.length} devices:`);
    
    devices.forEach(device => {
      console.log(`  - ${device.deviceId} (${device.status})`);
    });
    
    if (devices.length === 0) {
      console.log('❌ No devices found to reset');
      return;
    }
    
    // Ask which device to reset (for now, reset all)
    console.log('\n🔄 Resetting all devices to discovery mode...');
    
    // Reset device_discovery collection to force discovery mode
    await db.collection('device_discovery').updateMany(
      { status: 'paired' },
      { 
        $set: { 
          status: 'discovery',
          timestamp: new Date(),
          userId: null,
          deviceId: null
        }
      }
    );
    
    console.log('✅ Devices reset to discovery mode');
    console.log('📡 ESP8266 devices should now broadcast for discovery');
    console.log('⏰ Discovery mode lasts for 2 minutes after reset');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

forceDiscoveryMode();

