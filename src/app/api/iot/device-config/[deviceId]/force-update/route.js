import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/iot/device-config/[deviceId]/force-update - Force device to fetch new config
export async function POST(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { deviceId } = params;
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Check if device exists
    const device = await db.collection('devices').findOne({ deviceId });
    
    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device not found'
      }, { status: 404 });
    }
    
    // Update the device's lastUpdated timestamp to signal a config change
    const result = await db.collection('devices').updateOne(
      { deviceId },
      { 
        $set: { 
          updatedAt: new Date(),
          configUpdateRequested: true,
          lastConfigUpdateRequest: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update device configuration timestamp'
      }, { status: 500 });
    }
    
    console.log('🔄 Force Update: Configuration update signal sent for device:', deviceId);
    
    return NextResponse.json({
      success: true,
      message: 'Configuration update signal sent successfully',
      deviceId: deviceId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error sending force update signal:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send configuration update signal'
    }, { status: 500 });
  }
}
