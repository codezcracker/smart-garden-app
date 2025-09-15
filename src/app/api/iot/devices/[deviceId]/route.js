import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// DELETE /api/iot/devices/[deviceId] - Delete a device
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { deviceId } = params;
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Delete device configuration
    const deviceResult = await db.collection('devices').deleteOne({ deviceId });
    
    // Also delete all device data (optional - you might want to keep historical data)
    const dataResult = await db.collection('device_data').deleteMany({ deviceId });
    
    console.log('🗑️ Device API: Deleted device:', deviceId);
    console.log('📊 Deleted', deviceResult.deletedCount, 'device configs');
    console.log('📊 Deleted', dataResult.deletedCount, 'device data records');
    
    if (deviceResult.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Device not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully',
      deletedConfigs: deviceResult.deletedCount,
      deletedDataRecords: dataResult.deletedCount
    });
    
  } catch (error) {
    console.error('❌ Error deleting device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete device'
    }, { status: 500 });
  }
}

// GET /api/iot/devices/[deviceId] - Get specific device details
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { deviceId } = params;
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Get device configuration
    const device = await db.collection('devices').findOne({ deviceId });
    
    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device not found'
      }, { status: 404 });
    }
    
    // Get latest device data
    const latestData = await db.collection('device_data')
      .findOne({ deviceId }, { sort: { timestamp: -1 } });
    
    // Get device statistics
    const stats = await db.collection('device_data').aggregate([
      { $match: { deviceId } },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          firstSeen: { $min: '$timestamp' },
          lastSeen: { $max: '$timestamp' },
          avgTemperature: { $avg: '$sensors.temperature' },
          avgHumidity: { $avg: '$sensors.humidity' },
          avgLightLevel: { $avg: '$sensors.lightLevel' },
          avgSoilMoisture: { $avg: '$sensors.soilMoisture' }
        }
      }
    ]).toArray();
    
    const deviceDetails = {
      ...device,
      latestData,
      statistics: stats[0] || {
        totalRecords: 0,
        firstSeen: null,
        lastSeen: null,
        avgTemperature: null,
        avgHumidity: null,
        avgLightLevel: null,
        avgSoilMoisture: null
      },
      status: latestData ? 'online' : 'offline'
    };
    
    console.log('📱 Device API: Retrieved device details for:', deviceId);
    
    return NextResponse.json({
      success: true,
      device: deviceDetails
    });
    
  } catch (error) {
    console.error('❌ Error fetching device details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch device details'
    }, { status: 500 });
  }
}

// PUT /api/iot/devices/[deviceId] - Update device configuration
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { deviceId } = params;
    const updateData = await request.json();
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Prepare update document
    const updateDocument = {
      ...updateData,
      deviceId, // Ensure deviceId doesn't change
      updatedAt: new Date()
    };
    
    // Update device configuration
    const result = await db.collection('devices').updateOne(
      { deviceId },
      { $set: updateDocument }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Device not found'
      }, { status: 404 });
    }
    
    console.log('✏️ Device API: Updated device:', deviceId);
    console.log('📊 Update Data:', updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Device updated successfully',
      updatedFields: Object.keys(updateData)
    });
    
  } catch (error) {
    console.error('❌ Error updating device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update device'
    }, { status: 500 });
  }
}
