import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/iot/gardens/[gardenId] - Get specific garden configuration
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { gardenId } = await params;
    
    // Get garden configuration
    const garden = await db.collection('gardens').findOne({ gardenId });
    
    if (!garden) {
      return NextResponse.json({
        success: false,
        error: 'Garden not found'
      }, { status: 404 });
    }
    
    // Get devices in this garden
    const devices = await db.collection('user_devices').find({ gardenId }).toArray();
    
    // Get latest data for each device
    const devicesWithData = await Promise.all(
      devices.map(async (device) => {
        const latestData = await db.collection('device_data')
          .findOne({ deviceId: device.deviceId }, { sort: { timestamp: -1 } });
        
        return {
          ...device,
          lastSeen: latestData?.timestamp || null,
          wifiRSSI: latestData?.wifiRSSI || null,
          status: latestData ? 'online' : 'offline',
          latestData: latestData || null
        };
      })
    );
    
    console.log('🌱 Garden Config API: Retrieved garden', gardenId, 'with', devicesWithData.length, 'devices');
    
    return NextResponse.json({
      success: true,
      garden: garden,
      devices: devicesWithData
    });
    
  } catch (error) {
    console.error('❌ Error fetching garden config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch garden configuration'
    }, { status: 500 });
  }
}

// PUT /api/iot/gardens/[gardenId] - Update garden configuration
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { gardenId } = await params;
    
    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const updateData = await request.json();
    
    // Find garden
    const garden = await db.collection('gardens').findOne({ gardenId, userId });
    
    if (!garden) {
      return NextResponse.json({
        success: false,
        error: 'Garden not found or access denied'
      }, { status: 404 });
    }
    
    // Prepare update document
    const updateDocument = {
      ...updateData,
      updatedAt: new Date()
    };
    
    // Remove gardenId from update to avoid changing it
    delete updateDocument.gardenId;
    
    // Update garden
    const result = await db.collection('gardens').updateOne(
      { gardenId, userId },
      { $set: updateDocument }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'No changes made'
      }, { status: 400 });
    }
    
    console.log('🌱 Garden Config API: Updated garden', gardenId);
    
    return NextResponse.json({
      success: true,
      message: 'Garden configuration updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating garden config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update garden configuration'
    }, { status: 500 });
  }
}

// DELETE /api/iot/gardens/[gardenId] - Delete garden
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { gardenId } = await params;
    
    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Find garden
    const garden = await db.collection('gardens').findOne({ gardenId, userId });
    
    if (!garden) {
      return NextResponse.json({
        success: false,
        error: 'Garden not found or access denied'
      }, { status: 404 });
    }
    
    // Check if garden has devices
    const deviceCount = await db.collection('user_devices').countDocuments({ gardenId });
    
    if (deviceCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete garden with ${deviceCount} devices. Please remove all devices first.`
      }, { status: 400 });
    }
    
    // Delete garden
    const result = await db.collection('gardens').deleteOne({ gardenId, userId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete garden'
      }, { status: 500 });
    }
    
    console.log('🌱 Garden Config API: Deleted garden', gardenId);
    
    return NextResponse.json({
      success: true,
      message: 'Garden deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting garden:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete garden'
    }, { status: 500 });
  }
}
