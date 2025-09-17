import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/iot/device-config - Get device configuration by deviceId (with garden config)
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Get device configuration
    const device = await db.collection('user_devices').findOne({ deviceId });
    
    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device not found or not registered'
      }, { status: 404 });
    }
    
    // Get garden configuration
    const garden = await db.collection('gardens').findOne({ gardenId: device.gardenId });
    
    if (!garden) {
      return NextResponse.json({
        success: false,
        error: 'Garden configuration not found'
      }, { status: 404 });
    }
    
    // Update last seen timestamp
    await db.collection('user_devices').updateOne(
      { deviceId },
      { $set: { lastSeen: new Date(), status: 'online' } }
    );
    
    // Return configuration in ESP8266-friendly format (garden config takes precedence)
    const config = {
      success: true,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      location: device.location,
      description: device.description,
      gardenId: device.gardenId,
      gardenName: garden.gardenName,
      gardenLocation: garden.location,
      
      // Network configuration from garden
      network: {
        wifiSSID: garden.network.wifiSSID,
        wifiPassword: garden.network.wifiPassword,
        serverURL: garden.network.serverURL,
        backupServerURL: garden.network.backupServerURL
      },
      
      // Sensor configuration from device
      sensors: device.sensors,
      
      // Device settings
      settings: device.settings,
      
      // Garden settings
      gardenSettings: {
        timezone: garden.settings.timezone,
        units: garden.settings.units,
        alertThresholds: garden.settings.alertThresholds
      },
      
      // Metadata
      firmwareVersion: device.firmwareVersion,
      lastConfigUpdate: device.lastConfigUpdate,
      configVersion: device.configVersion || 1
    };
    
    console.log('📱 Device Config API: Sending config for', deviceId, 'from garden', garden.gardenName);
    
    return NextResponse.json(config);
    
  } catch (error) {
    console.error('❌ Error fetching device config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch device configuration'
    }, { status: 500 });
  }
}

// POST /api/iot/device-config - Update device configuration
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const updateData = await request.json();
    
    if (!updateData.deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Find device
    const device = await db.collection('user_devices').findOne({ deviceId: updateData.deviceId });
    
    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device not found'
      }, { status: 404 });
    }
    
    // Prepare update document
    const updateDocument = {
      ...updateData,
      lastConfigUpdate: new Date(),
      updatedAt: new Date(),
      configVersion: (device.configVersion || 1) + 1
    };
    
    // Remove deviceId from update to avoid changing it
    delete updateDocument.deviceId;
    
    // Update device
    const result = await db.collection('user_devices').updateOne(
      { deviceId: updateData.deviceId },
      { $set: updateDocument }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'No changes made'
      }, { status: 400 });
    }
    
    console.log('📱 Device Config API: Updated config for', updateData.deviceId);
    
    return NextResponse.json({
      success: true,
      message: 'Device configuration updated successfully',
      configVersion: updateDocument.configVersion
    });
    
  } catch (error) {
    console.error('❌ Error updating device config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update device configuration'
    }, { status: 500 });
  }
}
