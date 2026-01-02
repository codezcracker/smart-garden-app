import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

/**
 * Database Index Creation Script
 * Run this script to create indexes for optimal query performance
 * 
 * Usage: node scripts/create-indexes.js
 */

async function createIndexes() {
  try {
    await client.connect();
    const db = client.db('smartGardenDB');

    console.log('📊 Creating database indexes...\n');

    // Indexes for sensor_readings collection
    console.log('Creating indexes for sensor_readings...');
    await db.collection('sensor_readings').createIndex(
      { deviceId: 1, timestamp: -1 },
      { name: 'deviceId_timestamp_idx' }
    );
    console.log('✅ Created index: deviceId_timestamp_idx');

    await db.collection('sensor_readings').createIndex(
      { sensorType: 1, timestamp: -1 },
      { name: 'sensorType_timestamp_idx' }
    );
    console.log('✅ Created index: sensorType_timestamp_idx');

    await db.collection('sensor_readings').createIndex(
      { timestamp: -1 },
      { name: 'timestamp_idx' }
    );
    console.log('✅ Created index: timestamp_idx');

    // Indexes for devices collection
    console.log('\nCreating indexes for devices...');
    await db.collection('devices').createIndex(
      { userId: 1 },
      { name: 'userId_idx' }
    );
    console.log('✅ Created index: userId_idx');

    await db.collection('devices').createIndex(
      { macAddress: 1 },
      { name: 'macAddress_idx', unique: true }
    );
    console.log('✅ Created index: macAddress_idx (unique)');

    await db.collection('devices').createIndex(
      { status: 1, lastSeen: -1 },
      { name: 'status_lastSeen_idx' }
    );
    console.log('✅ Created index: status_lastSeen_idx');

    // Indexes for users collection
    console.log('\nCreating indexes for users...');
    await db.collection('users').createIndex(
      { email: 1 },
      { name: 'email_idx', unique: true }
    );
    console.log('✅ Created index: email_idx (unique)');

    // Indexes for plants_collection (390K records)
    console.log('\nCreating indexes for plants_collection...');
    await db.collection('plants_collection').createIndex(
      { name: 'text', commonName: 'text', scientificName: 'text' },
      { name: 'text_search_idx' }
    );
    console.log('✅ Created index: text_search_idx (text search)');

    await db.collection('plants_collection').createIndex(
      { commonName: 1 },
      { name: 'commonName_idx' }
    );
    console.log('✅ Created index: commonName_idx');

    await db.collection('plants_collection').createIndex(
      { scientificName: 1 },
      { name: 'scientificName_idx' }
    );
    console.log('✅ Created index: scientificName_idx');

    await db.collection('plants_collection').createIndex(
      { category: 1 },
      { name: 'category_idx' }
    );
    console.log('✅ Created index: category_idx');

    await db.collection('plants_collection').createIndex(
      { family: 1 },
      { name: 'family_idx' }
    );
    console.log('✅ Created index: family_idx');

    // Indexes for iot_device_data collection
    console.log('\nCreating indexes for iot_device_data...');
    await db.collection('iot_device_data').createIndex(
      { deviceId: 1, receivedAt: -1 },
      { name: 'deviceId_receivedAt_idx' }
    );
    console.log('✅ Created index: deviceId_receivedAt_idx');

    await db.collection('iot_device_data').createIndex(
      { receivedAt: -1 },
      { name: 'receivedAt_idx' }
    );
    console.log('✅ Created index: receivedAt_idx');

    // Indexes for control_commands collection
    console.log('\nCreating indexes for control_commands...');
    await db.collection('control_commands').createIndex(
      { deviceId: 1, createdAt: -1 },
      { name: 'deviceId_createdAt_idx' }
    );
    console.log('✅ Created index: deviceId_createdAt_idx');

    await db.collection('control_commands').createIndex(
      { status: 1, createdAt: -1 },
      { name: 'status_createdAt_idx' }
    );
    console.log('✅ Created index: status_createdAt_idx');

    // Indexes for user_devices collection
    console.log('\nCreating indexes for user_devices...');
    await db.collection('user_devices').createIndex(
      { userId: 1 },
      { name: 'userId_idx' }
    );
    console.log('✅ Created index: userId_idx');

    await db.collection('user_devices').createIndex(
      { deviceId: 1 },
      { name: 'deviceId_idx', unique: true }
    );
    console.log('✅ Created index: deviceId_idx (unique)');

    // Indexes for iot_devices collection
    console.log('\nCreating indexes for iot_devices...');
    await db.collection('iot_devices').createIndex(
      { deviceId: 1 },
      { name: 'deviceId_idx', unique: true }
    );
    console.log('✅ Created index: deviceId_idx (unique)');

    await db.collection('iot_devices').createIndex(
      { status: 1, lastSeen: -1 },
      { name: 'status_lastSeen_idx' }
    );
    console.log('✅ Created index: status_lastSeen_idx');

    console.log('\n✨ All indexes created successfully!');
    console.log('\n📊 Index Summary:');
    console.log('   - sensor_readings: 3 indexes');
    console.log('   - devices: 3 indexes');
    console.log('   - users: 1 index');
    console.log('   - plants_collection: 5 indexes (including text search)');
    console.log('   - iot_device_data: 2 indexes');
    console.log('   - control_commands: 2 indexes');
    console.log('   - user_devices: 2 indexes');
    console.log('   - iot_devices: 2 indexes');
    console.log('\n   Total: 20 indexes created');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run if executed directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('\n✅ Index creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Index creation failed:', error);
      process.exit(1);
    });
}

export { createIndexes };




