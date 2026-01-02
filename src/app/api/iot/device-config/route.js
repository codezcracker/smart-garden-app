import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// Middleware to verify JWT token
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  if (!token || token.length === 0) {
    throw new Error('Token is empty');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('JWT expired - please log in again');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token - please log in again');
    } else {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
}

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
    
    // Verify JWT token and get user ID
    let decoded;
    try {
      decoded = verifyToken(request);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error.message || 'Authentication required'
      }, { status: 401 });
    }
    
    const actualUserId = decoded.userId || decoded.id;
    
    if (!actualUserId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token: user ID not found'
      }, { status: 401 });
    }
    
    const updateData = await request.json();
    
    if (!updateData.deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Convert userId to string for consistency
    const userIdString = actualUserId.toString ? actualUserId.toString() : actualUserId;
    
    // Find device and verify ownership
    const device = await db.collection('user_devices').findOne({ 
      deviceId: updateData.deviceId,
      userId: { $in: [userIdString, actualUserId, new ObjectId(userIdString)] }
    });
    
    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device not found or access denied'
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
