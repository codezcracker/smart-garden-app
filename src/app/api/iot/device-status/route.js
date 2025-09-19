import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serial');
    
    if (!serialNumber) {
      return NextResponse.json(
        { success: false, error: 'Serial number required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if device is paired
    const discoveryDevice = await db.collection('device_discovery').findOne({
      id: serialNumber
    });
    
    if (!discoveryDevice) {
      return NextResponse.json({
        success: true,
        paired: false,
        message: 'Device not found in discovery'
      });
    }
    
    if (discoveryDevice.status === 'paired') {
      return NextResponse.json({
        success: true,
        paired: true,
        deviceId: discoveryDevice.deviceId,
        message: 'Device is paired'
      });
    } else {
      return NextResponse.json({
        success: true,
        paired: false,
        message: 'Device in discovery mode'
      });
    }
    
  } catch (error) {
    console.error('❌ Device status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check device status' },
      { status: 500 }
    );
  }
}
