const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://codezcracker:Ars%401234@atlascluster.fs3ipnn.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const MONGODB_DB = 'smartGardenDB';

async function cleanupDevices() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Remove all devices from all collections
    console.log('🧹 Cleaning up old devices...');
    
    // Clear device discovery collection
    const discoveryResult = await db.collection('device_discovery').deleteMany({});
    console.log(`🗑️ Removed ${discoveryResult.deletedCount} devices from device_discovery`);
    
    // Clear user devices collection
    const userDevicesResult = await db.collection('user_devices').deleteMany({});
    console.log(`🗑️ Removed ${userDevicesResult.deletedCount} devices from user_devices`);
    
    // Clear iot devices collection
    const iotDevicesResult = await db.collection('iot_devices').deleteMany({});
    console.log(`🗑️ Removed ${iotDevicesResult.deletedCount} devices from iot_devices`);
    
    // Clear device data collection
    const deviceDataResult = await db.collection('device_data').deleteMany({});
    console.log(`🗑️ Removed ${deviceDataResult.deletedCount} entries from device_data`);
    
    console.log('✅ Database cleanup completed!');
    console.log('🎯 Ready for fresh device discovery and pairing');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await client.close();
  }
}

cleanupDevices();
