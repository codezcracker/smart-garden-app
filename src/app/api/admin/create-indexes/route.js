import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

/**
 * API endpoint to create database indexes
 * POST /api/admin/create-indexes
 * 
 * Requires admin authentication
 */
/**
 * Create database indexes function (inline to avoid import issues)
 */
async function createIndexes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('smartGardenDB');

    // Indexes for sensor_readings collection
    await db.collection('sensor_readings').createIndex(
      { deviceId: 1, timestamp: -1 },
      { name: 'deviceId_timestamp_idx' }
    );
    await db.collection('sensor_readings').createIndex(
      { sensorType: 1, timestamp: -1 },
      { name: 'sensorType_timestamp_idx' }
    );
    await db.collection('sensor_readings').createIndex(
      { timestamp: -1 },
      { name: 'timestamp_idx' }
    );

    // Indexes for devices collection
    await db.collection('devices').createIndex(
      { userId: 1 },
      { name: 'userId_idx' }
    );
    await db.collection('devices').createIndex(
      { macAddress: 1 },
      { name: 'macAddress_idx', unique: true }
    );
    await db.collection('devices').createIndex(
      { status: 1, lastSeen: -1 },
      { name: 'status_lastSeen_idx' }
    );

    // Indexes for users collection
    await db.collection('users').createIndex(
      { email: 1 },
      { name: 'email_idx', unique: true }
    );

    // Indexes for plants_collection
    await db.collection('plants_collection').createIndex(
      { name: 'text', commonName: 'text', scientificName: 'text' },
      { name: 'text_search_idx' }
    );
    await db.collection('plants_collection').createIndex(
      { commonName: 1 },
      { name: 'commonName_idx' }
    );
    await db.collection('plants_collection').createIndex(
      { scientificName: 1 },
      { name: 'scientificName_idx' }
    );
    await db.collection('plants_collection').createIndex(
      { category: 1 },
      { name: 'category_idx' }
    );
    await db.collection('plants_collection').createIndex(
      { family: 1 },
      { name: 'family_idx' }
    );

    // Indexes for other collections
    await db.collection('iot_device_data').createIndex(
      { deviceId: 1, receivedAt: -1 },
      { name: 'deviceId_receivedAt_idx' }
    );
    await db.collection('control_commands').createIndex(
      { deviceId: 1, createdAt: -1 },
      { name: 'deviceId_createdAt_idx' }
    );
    await db.collection('user_devices').createIndex(
      { userId: 1 },
      { name: 'userId_idx' }
    );
    await db.collection('iot_devices').createIndex(
      { deviceId: 1 },
      { name: 'deviceId_idx', unique: true }
    );

  } finally {
    await client.close();
  }
}

export async function POST(request) {
  try {
    // In production, add admin authentication check here
    // const decoded = verifyAdminToken(request);

    console.log('📊 Creating database indexes via API...');

    await createIndexes();

    return NextResponse.json({
      success: true,
      message: 'Database indexes created successfully',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating indexes:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create indexes'
    }, { status: 500 });
  }
}

// GET: Get index information
export async function GET(request) {
  try {
    const { MongoClient } = await import('mongodb');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    await client.connect();
    const db = client.db('smartGardenDB');

    const collections = [
      'sensor_readings',
      'devices',
      'users',
      'plants_collection',
      'iot_device_data',
      'control_commands',
      'user_devices',
      'iot_devices'
    ];

    const indexInfo = {};

    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        indexInfo[collectionName] = indexes.map(idx => ({
          name: idx.name,
          key: idx.key,
          unique: idx.unique || false
        }));
      } catch (error) {
        indexInfo[collectionName] = { error: error.message };
      }
    }

    await client.close();

    return NextResponse.json({
      indexes: indexInfo,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching index information:', error);
    return NextResponse.json({
      error: 'Failed to fetch index information'
    }, { status: 500 });
  }
}

