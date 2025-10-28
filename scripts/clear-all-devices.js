const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codezcracker:Ars%401234@atlascluster.fs3ipnn.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const MONGODB_DB = 'smartGardenDB';

async function clearAllDeviceData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Collections to clear
    const collections = [
      'user_devices',
      'iot_devices', 
      'device_data',
      'discovery_devices',
      'device_configurations'
    ];
    
    console.log('🧹 Clearing all device-related data...');
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(`✅ Cleared ${result.deletedCount} documents from ${collectionName}`);
    }
    
    console.log('🎉 All device data cleared successfully!');
    console.log('📱 Your devices page should now show "No devices registered"');
    
  } catch (error) {
    console.error('❌ Error clearing device data:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
clearAllDeviceData();
