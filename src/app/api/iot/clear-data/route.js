import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function DELETE(request) {
  try {
    console.log('🗑️ Clearing IoT data...');
    
    const { db } = await connectToDatabase();
    
    // Clear IoT device data
    const deviceDataResult = await db.collection('iot_device_data').deleteMany({});
    console.log(`🗑️ Deleted ${deviceDataResult.deletedCount} device data records`);
    
    // Clear IoT devices
    const devicesResult = await db.collection('iot_devices').deleteMany({});
    console.log(`🗑️ Deleted ${devicesResult.deletedCount} device records`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'IoT data cleared successfully',
      deletedData: deviceDataResult.deletedCount,
      deletedDevices: devicesResult.deletedCount
    });

  } catch (error) {
    console.error('❌ Error clearing IoT data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear IoT data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
