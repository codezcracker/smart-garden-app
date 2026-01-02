import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// Middleware to verify JWT token and extract user ID
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ No authorization header or Bearer token missing');
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  if (!token || token.length === 0) {
    console.error('❌ Token is empty');
    throw new Error('Token is empty');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified successfully:', {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiration'
    });
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', {
      error: error.message,
      name: error.name,
      expired: error.name === 'TokenExpiredError',
      invalid: error.name === 'JsonWebTokenError'
    });
    
    // Provide more specific error messages
    if (error.name === 'TokenExpiredError') {
      throw new Error('JWT expired - please log in again');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token - please log in again');
    } else {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
}

// GET /api/iot/user-devices - Get devices for authenticated user
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Verify JWT token and get user ID
    let decoded;
    try {
      decoded = verifyToken(request);
    } catch (error) {
      console.error('❌ Token verification error in GET /api/iot/user-devices:', error.message);
      return NextResponse.json({
        success: false,
        error: error.message || 'Authentication required',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          hint: 'Make sure you are logged in and your token is valid. Token may have expired.'
        } : undefined
      }, { status: 401 });
    }
    
    const actualUserId = decoded.userId || decoded.id;
    
    if (!actualUserId) {
      console.error('❌ User Devices API: No user ID in token', {
        decoded,
        hasUserId: !!decoded.userId,
        hasId: !!decoded.id,
        keys: Object.keys(decoded)
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid token: user ID not found'
      }, { status: 401 });
    }
    
    // Convert userId to string if it's an ObjectId
    const userIdString = actualUserId.toString ? actualUserId.toString() : actualUserId;
    
    console.log('📱 User Devices API: Using userId:', userIdString, 'Role:', decoded.role, 'Type:', typeof actualUserId);
    
    // Get devices belonging to this user from user_devices collection
    // Try both string and ObjectId formats
    let userDevices = [];
    try {
      // Try with string userId first
      console.log('📱 Querying user_devices with userId:', userIdString);
      userDevices = await db.collection('user_devices').find({ userId: userIdString }).toArray();
      console.log('📱 Found', userDevices.length, 'devices in user_devices with string userId');
      
      // If no devices found and userId looks like ObjectId, try with ObjectId
      if (userDevices.length === 0 && userIdString.length === 24) {
        try {
          console.log('📱 Trying user_devices with ObjectId:', userIdString);
          userDevices = await db.collection('user_devices').find({ userId: new ObjectId(userIdString) }).toArray();
          console.log('📱 Found', userDevices.length, 'devices in user_devices with ObjectId');
        } catch (err) {
          console.log('⚠️ Could not query user_devices with ObjectId:', err.message);
        }
      }
      
      // Also try with just the userId field without format conversion (for debugging)
      if (userDevices.length === 0) {
        console.log('📱 Trying user_devices with original actualUserId:', actualUserId);
        try {
          userDevices = await db.collection('user_devices').find({ userId: actualUserId }).toArray();
          console.log('📱 Found', userDevices.length, 'devices in user_devices with original userId');
        } catch (err) {
          console.log('⚠️ Could not query user_devices with original userId:', err.message);
        }
      }
    } catch (error) {
      console.error('❌ Error querying user_devices:', error);
    }
    
    // Also check devices collection for devices that might be associated with this user
    // (in case devices are stored there instead)
    let devicesFromDevicesCollection = [];
    try {
      // For super_admin and manager, get all devices
      if (decoded.role === 'super_admin' || decoded.role === 'manager') {
        console.log('📱 User Devices API: Admin/Manager - fetching all devices');
        devicesFromDevicesCollection = await db.collection('devices').find({}).toArray();
        console.log('📱 User Devices API: Found', devicesFromDevicesCollection.length, 'devices in devices collection');
      } else {
        // For regular users, try to find devices by userId if the field exists
        // Try both string and ObjectId formats
        try {
          // Try with string userId first
          console.log('📱 Querying devices collection with userId string:', userIdString);
          devicesFromDevicesCollection = await db.collection('devices').find({ 
            userId: userIdString
          }).toArray();
          console.log('📱 Found', devicesFromDevicesCollection.length, 'devices with string userId');
          
          // If no devices found and userId looks like ObjectId, try with ObjectId
          if (devicesFromDevicesCollection.length === 0 && userIdString.length === 24) {
            try {
              console.log('📱 Trying devices collection with ObjectId:', userIdString);
              devicesFromDevicesCollection = await db.collection('devices').find({ 
                userId: new ObjectId(userIdString)
              }).toArray();
              console.log('📱 Found', devicesFromDevicesCollection.length, 'devices with ObjectId');
            } catch (err) {
              console.log('⚠️ Could not convert userId to ObjectId:', err.message);
            }
          }
          
          // Also try with original actualUserId
          if (devicesFromDevicesCollection.length === 0) {
            console.log('📱 Trying devices collection with original actualUserId:', actualUserId);
            try {
              devicesFromDevicesCollection = await db.collection('devices').find({ 
                userId: actualUserId
              }).toArray();
              console.log('📱 Found', devicesFromDevicesCollection.length, 'devices with original userId');
            } catch (err) {
              console.log('⚠️ Could not query devices with original userId:', err.message);
            }
          }
        } catch (err) {
          console.log('⚠️ Error querying devices collection:', err.message);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not query devices collection:', error.message);
    }
    
    // Combine devices from both collections
    // Map user_devices to match expected format
    const mappedUserDevices = userDevices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName || device.deviceId,
      status: device.status || 'offline',
      firmwareVersion: device.firmwareVersion || '1.0.0',
      location: device.location || '',
      description: device.description || '',
      macAddress: device.macAddress || null
    }));
    
    // Map devices collection to match expected format
    const mappedDevicesCollection = devicesFromDevicesCollection.map(device => ({
      deviceId: device.deviceId || device.macAddress || device._id?.toString() || `device_${device._id}`,
      deviceName: device.deviceName || device.name || device.macAddress || device.deviceId || `Device ${device._id}`,
      status: device.status || 'offline',
      firmwareVersion: device.firmwareVersion || '1.0.0',
      location: device.location || '',
      description: device.description || '',
      macAddress: device.macAddress || null
    }));
    
    // Combine and deduplicate by deviceId
    const deviceMap = new Map();
    [...mappedUserDevices, ...mappedDevicesCollection].forEach(device => {
      if (device.deviceId && !deviceMap.has(device.deviceId)) {
        deviceMap.set(device.deviceId, device);
      }
    });
    
    const devices = Array.from(deviceMap.values());
    
    // Get latest data for each device
    const devicesWithData = await Promise.all(
      devices.map(async (device) => {
        // Try multiple ways to find device data
        let latestData = null;
        let sensorData = null;
        
        // Try device_data collection
        try {
          latestData = await db.collection('device_data')
            .findOne({ deviceId: device.deviceId }, { sort: { timestamp: -1 } });
        } catch (error) {
          // Ignore if collection doesn't exist or query fails
        }
        
        // Try sensor_readings collection
        try {
          sensorData = await db.collection('sensor_readings')
            .findOne({ deviceId: device.deviceId }, { sort: { timestamp: -1 } });
        } catch (error) {
          // Ignore if collection doesn't exist
        }
        
        // If still no data, try with macAddress if device has one
        if (!latestData && !sensorData && device.macAddress) {
          try {
            latestData = await db.collection('device_data')
              .findOne({ macAddress: device.macAddress }, { sort: { timestamp: -1 } });
          } catch (error) {
            // Ignore
          }
        }
        
        return {
          ...device,
          lastSeen: latestData?.timestamp || sensorData?.timestamp || null,
          wifiRSSI: latestData?.wifiRSSI || sensorData?.wifiRSSI || null,
          status: (latestData || sensorData) ? 'online' : (device.status || 'offline'),
          latestData: latestData || sensorData || null
        };
      })
    );
    
    console.log('📱 User Devices API: Retrieved', devicesWithData.length, 'devices for user', actualUserId);
    
    return NextResponse.json({
      success: true,
      devices: devicesWithData
    });
    
  } catch (error) {
    console.error('❌ Error fetching user devices:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user devices'
    }, { status: 500 });
  }
}

// POST /api/iot/user-devices - Create new device for authenticated user
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
    
    console.log('📱 User Devices API: Creating device for userId:', actualUserId);
    
    const deviceData = await request.json();
    
    // Validate required fields
    if (!deviceData.deviceId || !deviceData.deviceName) {
      return NextResponse.json({
        success: false,
        error: 'Device ID and Device Name are required'
      }, { status: 400 });
    }
    
    // Convert userId to string for consistency
    const userIdString = actualUserId.toString ? actualUserId.toString() : actualUserId;
    
    // Handle garden - create default garden if not provided or doesn't exist
    let gardenId = deviceData.gardenId;
    
    if (!gardenId || gardenId === '') {
      // Check if user has any gardens
      const userGardens = await db.collection('gardens').find({ 
        userId: { $in: [userIdString, actualUserId, new ObjectId(userIdString)] }
      }).toArray();
      
      if (userGardens.length > 0) {
        // Use the first garden
        gardenId = userGardens[0].gardenId;
        console.log('📱 Using existing garden:', gardenId);
      } else {
        // Create a default garden for the user
        const defaultGardenId = `GARDEN_${Date.now()}`;
        const defaultGarden = {
          gardenId: defaultGardenId,
          userId: userIdString,
          gardenName: 'My Garden',
          location: 'Home',
          description: 'Default garden created automatically',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('gardens').insertOne(defaultGarden);
        gardenId = defaultGardenId;
        console.log('📱 Created default garden for user:', defaultGardenId);
      }
    } else {
      // Verify garden exists and belongs to user
      const garden = await db.collection('gardens').findOne({ 
        $or: [
          { gardenId: gardenId, userId: userIdString },
          { gardenId: gardenId, userId: actualUserId },
          { gardenId: gardenId, userId: new ObjectId(userIdString) }
        ]
      });
      
      if (!garden) {
        // Create the garden if it doesn't exist (for backward compatibility)
        const newGarden = {
          gardenId: gardenId,
          userId: userIdString,
          gardenName: deviceData.gardenName || 'My Garden',
          location: deviceData.location || 'Home',
          description: deviceData.description || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('gardens').insertOne(newGarden);
        console.log('📱 Created garden for device:', gardenId);
      }
    }
    
    // Check if device ID already exists for any user
    const existingDevice = await db.collection('user_devices').findOne({ deviceId: deviceData.deviceId });
    if (existingDevice) {
      return NextResponse.json({
        success: false,
        error: 'Device ID already exists'
      }, { status: 409 });
    }
    
    // Create device document
    const deviceDocument = {
      userId: userIdString,
      gardenId: gardenId,
      deviceId: deviceData.deviceId,
      deviceName: deviceData.deviceName,
      deviceType: deviceData.deviceType || 'ESP8266',
      location: deviceData.location || '',
      description: deviceData.description || '',
      
      // Sensor configuration
      sensors: {
        temperature: {
          enabled: deviceData.temperatureEnabled !== false,
          calibration: deviceData.temperatureCalibration || { offset: 0, scale: 1 }
        },
        humidity: {
          enabled: deviceData.humidityEnabled !== false,
          calibration: deviceData.humidityCalibration || { offset: 0, scale: 1 }
        },
        lightLevel: {
          enabled: deviceData.lightLevelEnabled !== false,
          calibration: deviceData.lightLevelCalibration || { min: 0, max: 1024 }
        },
        soilMoisture: {
          enabled: deviceData.soilMoistureEnabled !== false,
          calibration: deviceData.soilMoistureCalibration || { min: 0, max: 1024 }
        }
      },
      
      // Device settings
      settings: {
        sendInterval: deviceData.sendInterval || 1000,
        reconnectAttempts: deviceData.reconnectAttempts || 3,
        timeout: deviceData.timeout || 5000,
        deepSleepEnabled: deviceData.deepSleepEnabled || false,
        deepSleepDuration: deviceData.deepSleepDuration || 300000 // 5 minutes
      },
      
      // Status and metadata
      status: 'inactive',
      firmwareVersion: deviceData.firmwareVersion || '1.0.0',
      lastConfigUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert device
    const result = await db.collection('user_devices').insertOne(deviceDocument);
    
    console.log('📱 User Devices API: Created device', deviceData.deviceId, 'for user', actualUserId);
    
    return NextResponse.json({
      success: true,
      message: 'Device created successfully',
      device: {
        _id: result.insertedId,
        deviceId: deviceData.deviceId,
        deviceName: deviceData.deviceName,
        status: 'inactive'
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create device'
    }, { status: 500 });
  }
}

// DELETE /api/iot/user-devices - Delete a device
export async function DELETE(request) {
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
    
    // Get deviceId from query parameters
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Convert userId to string for consistency
    const userIdString = actualUserId.toString ? actualUserId.toString() : actualUserId;
    
    console.log('🗑️ User Devices API: Deleting device:', deviceId, 'for userId:', userIdString);
    
    // Find device and verify ownership
    const device = await db.collection('user_devices').findOne({ 
      deviceId: deviceId,
      userId: { $in: [userIdString, actualUserId, new ObjectId(userIdString)] }
    });
    
    if (!device) {
      // Also check devices collection
      const deviceInDevicesCollection = await db.collection('devices').findOne({ 
        deviceId: deviceId,
        userId: { $in: [userIdString, actualUserId, new ObjectId(userIdString)] }
      });
      
      if (!deviceInDevicesCollection) {
        return NextResponse.json({
          success: false,
          error: 'Device not found or access denied'
        }, { status: 404 });
      }
      
      // Delete from devices collection
      const result = await db.collection('devices').deleteOne({ deviceId: deviceId });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({
          success: false,
          error: 'Failed to delete device'
        }, { status: 500 });
      }
      
      console.log('🗑️ User Devices API: Deleted device from devices collection:', deviceId);
      
      return NextResponse.json({
        success: true,
        message: 'Device deleted successfully'
      });
    }
    
    // Delete from user_devices collection
    const result = await db.collection('user_devices').deleteOne({ deviceId: deviceId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete device'
      }, { status: 500 });
    }
    
    // Also try to delete from devices collection if it exists
    try {
      await db.collection('devices').deleteOne({ deviceId: deviceId });
    } catch (error) {
      // Ignore if device doesn't exist in devices collection
    }
    
    // Also delete from iot_devices collection to clear status
    try {
      await db.collection('iot_devices').deleteOne({ deviceId: deviceId });
      console.log('🗑️ Deleted from iot_devices collection:', deviceId);
    } catch (error) {
      // Ignore if doesn't exist
    }
    
    // Delete associated sensor data (optional - you may want to keep historical data)
    // Uncomment if you want to delete all sensor data for this device
    // await db.collection('sensor_readings').deleteMany({ deviceId: deviceId });
    // await db.collection('iot_device_data').deleteMany({ deviceId: deviceId });
    
    console.log('🗑️ User Devices API: Deleted device:', deviceId);
    
    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting device:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete device'
    }, { status: 500 });
  }
}
