import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    console.log('🔬 Sensor Test API: Fetching all sensor data');
    
    const { db } = await connectToDatabase();
    
    // Get all sensor data from the last 24 hours, sorted by most recent first
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const sensorData = await db.collection('iot_device_data')
      .find({
        receivedAt: { $gte: twentyFourHoursAgo }
      })
      .sort({ receivedAt: -1 })
      .limit(50) // Limit to last 50 records for performance
      .toArray();

    console.log(`📊 Found ${sensorData.length} sensor data records`);

    return NextResponse.json(sensorData, { status: 200 });

  } catch (error) {
    console.error('❌ Sensor Test API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data', details: error.message },
      { status: 500 }
    );
  }
}

// Allow POST for testing purposes
export async function POST(request) {
  try {
    console.log('🔬 Sensor Test API: Received test data');
    
    const data = await request.json();
    console.log('📊 Test Data:', data);
    
    return NextResponse.json({
      message: 'Test data received successfully',
      receivedData: data,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Sensor Test API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process test data', details: error.message },
      { status: 500 }
    );
  }
}


