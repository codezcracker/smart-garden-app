import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// User JWT authentication
function verifyUserToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// POST: Send control commands to ESP32 devices
export async function POST(request) {
  try {
    const decoded = verifyUserToken(request);
    const userId = decoded.userId;

    const { deviceId, action, parameters, macAddress } = await request.json();
    
    console.log('📥 POST /api/devices/control - Received:', { 
      deviceId, 
      action, 
      hasMacAddress: !!macAddress,
      macAddress: macAddress?.substring(0, 8) + '...' // Log partial MAC for privacy
    });

    // Validate input
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // For testing: Allow MAC address instead of deviceId
    let targetDeviceId = deviceId;
    let device = null;

    const validActions = ['water', 'light_on', 'light_off', 'set_light_brightness', 'laser_on', 'laser_off', 'get_status'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Valid actions: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const commandsCollection = db.collection('control_commands');

    // For testing: If MAC address provided, find or create device
    if (macAddress && !deviceId) {
      device = await devicesCollection.findOne({
        macAddress: macAddress.toUpperCase()
      });
      
      if (!device) {
        // Auto-register device for testing
        console.log('⚠️ Auto-registering device for testing:', macAddress);
        const tempDevice = {
          macAddress: macAddress.toUpperCase(),
          deviceName: `ESP32_${macAddress.substring(0, 8)}`,
          deviceType: 'ESP32_Laser',
          location: 'Test',
          status: 'online',
          firmwareVersion: '1.0.0',
          lastSeen: new Date(),
          isTestDevice: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const insertResult = await devicesCollection.insertOne(tempDevice);
        device = {
          _id: insertResult.insertedId,
          ...tempDevice
        };
        console.log('✅ Auto-registered test device:', device._id);
      }
      targetDeviceId = device._id.toString();
    } else if (deviceId) {
      // Try to find device by ID
      try {
        device = await devicesCollection.findOne({
          _id: new ObjectId(deviceId)
        });
      } catch (error) {
        console.error('Error finding device by ID:', error);
        device = null;
      }

      // If device not found by ID and MAC address provided, try finding by MAC
      if (!device && macAddress) {
        console.log('🔍 Device not found by ID, trying MAC address:', macAddress);
        // Try with uppercase
        device = await devicesCollection.findOne({
          macAddress: macAddress.toUpperCase()
        });
        // If not found, try without colons/dashes
        if (!device) {
          const cleanMac = macAddress.replace(/[:-]/g, '').toUpperCase();
          device = await devicesCollection.findOne({
            macAddress: cleanMac
          });
        }
        // If still not found, try with colons
        if (!device) {
          const colonMac = macAddress.replace(/(.{2})/g, '$1:').slice(0, -1).toUpperCase();
          device = await devicesCollection.findOne({
            macAddress: colonMac
          });
        }
        if (device) {
          targetDeviceId = device._id.toString();
          console.log('✅ Found device by MAC address:', targetDeviceId);
        } else {
          console.log('⚠️ Device not found by MAC either, will auto-register if needed');
        }
      }

      if (!device) {
        console.error('❌ Device not found:', { 
          deviceId, 
          macAddress,
          deviceIdType: typeof deviceId,
          deviceIdLength: deviceId?.length
        });
        
        // If MAC address provided, auto-register the device (but skip if MAC is invalid)
        if (macAddress) {
          const cleanMac = macAddress.replace(/[:-]/g, '').toUpperCase();
          
          // Skip auto-registration for invalid MAC addresses
          if (cleanMac === '000000000000' || cleanMac.length < 12) {
            console.error('❌ Invalid MAC address, cannot auto-register:', cleanMac);
            return NextResponse.json(
              { 
                error: 'Invalid MAC address. Please ensure ESP32 has polled the server at least once to register with its real MAC address.',
                hint: 'Check Serial Monitor on ESP32 to see the MAC address'
              },
              { status: 400 }
            );
          }
          
          console.log('🆕 Auto-registering device with MAC:', cleanMac);
          const tempDevice = {
            macAddress: cleanMac,
            deviceName: `ESP32_${cleanMac.substring(0, 8)}`,
            deviceType: 'ESP32_Laser',
            location: 'Auto-registered',
            status: 'online',
            firmwareVersion: '1.0.0',
            lastSeen: new Date(),
            isTestDevice: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          const insertResult = await devicesCollection.insertOne(tempDevice);
          device = {
            _id: insertResult.insertedId,
            ...tempDevice
          };
          targetDeviceId = device._id.toString();
          console.log('✅ Auto-registered device:', targetDeviceId);
        } else {
          // Try to find any device (for debugging)
          const allDevices = await devicesCollection.find({}).limit(10).toArray();
          console.log('📋 Sample devices in database:', allDevices.map(d => ({
            id: d._id?.toString(),
            mac: d.macAddress,
            name: d.deviceName
          })));
          
          return NextResponse.json(
            { 
              error: 'Device not found. Make sure the ESP32 has polled the server at least once, or provide MAC address.',
              details: {
                deviceId,
                macAddress: macAddress || 'not provided',
                hint: 'Device will be auto-registered if MAC address is provided'
              }
            },
            { status: 404 }
          );
        }
      }

      // For test devices or if no userId, allow access
      // Otherwise verify user owns the device
      if (device.userId && !device.isTestDevice) {
        const deviceUserId = device.userId.toString ? device.userId.toString() : device.userId;
        const requestUserId = userId.toString ? userId.toString() : userId;
        if (deviceUserId !== requestUserId) {
          return NextResponse.json(
            { error: 'Device not found or access denied' },
            { status: 404 }
          );
        }
      }
      
      if (!targetDeviceId) {
        // If we have a device but no targetDeviceId, use device._id
        if (device && device._id) {
          targetDeviceId = device._id.toString();
        } else {
          targetDeviceId = deviceId;
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Device ID or MAC address is required' },
        { status: 400 }
      );
    }

    // Validate targetDeviceId before proceeding
    if (!targetDeviceId) {
      console.error('❌ No targetDeviceId after device lookup:', { deviceId, macAddress, device });
      return NextResponse.json(
        { error: 'Could not determine target device. Please ensure device is registered or provide valid MAC address.' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    let targetObjectId;
    try {
      targetObjectId = new ObjectId(targetDeviceId);
    } catch (error) {
      console.error('❌ Invalid ObjectId format:', targetDeviceId, error);
      return NextResponse.json(
        { error: 'Invalid device ID format' },
        { status: 400 }
      );
    }

    // Update device status to online (for test devices or if offline)
    if (device.status !== 'online' || device.isTestDevice) {
      await devicesCollection.updateOne(
        { _id: device._id },
        { 
          $set: { 
            status: 'online',
            lastSeen: new Date()
          }
        }
      );
    }

    // Validate action-specific parameters
    let validatedParams = {};
    
    switch (action) {
      case 'water':
        const duration = parameters?.duration || 30; // Default 30 seconds
        if (duration < 1 || duration > 300) { // Max 5 minutes
          return NextResponse.json(
            { error: 'Water duration must be between 1 and 300 seconds' },
            { status: 400 }
          );
        }
        validatedParams = { duration };
        break;
        
      case 'set_light_brightness':
        const brightness = parameters?.brightness;
        if (brightness === undefined || brightness < 0 || brightness > 100) {
          return NextResponse.json(
            { error: 'Brightness must be between 0 and 100' },
            { status: 400 }
          );
        }
        validatedParams = { brightness };
        break;
        
      case 'light_on':
        validatedParams = { brightness: parameters?.brightness || 80 };
        break;
        
      case 'light_off':
      case 'laser_on':
      case 'laser_off':
      case 'get_status':
        validatedParams = {};
        break;
    }

    // Check if there's already a pending/sent command for the same action (prevent duplicates)
    // Only check for pending/sent, not delivered (delivered means ESP32 already got it)
    const existingCommand = await commandsCollection.findOne({
      deviceId: targetObjectId,
      action: action,
      status: { $in: ['pending', 'sent'] }, // Only check pending/sent, not delivered
      createdAt: { $gte: new Date(Date.now() - 1000) } // Within last 1 second only (very lenient)
    });

    if (existingCommand) {
      console.log(`⚠️ Duplicate command prevented - Action: ${action}, Existing ID: ${existingCommand._id}, Status: ${existingCommand.status}`);
      // Still return success but with existing command ID
      return NextResponse.json({
        message: 'Command already in queue',
        commandId: existingCommand._id,
        action,
        parameters: validatedParams
      }, { status: 200 });
    }

    // Create control command - set status to 'sent' immediately for instant pickup by ESP32
    const now = new Date();
    const command = {
      deviceId: targetObjectId,
      userId: device?.userId ? (device.userId.toString ? new ObjectId(device.userId.toString()) : new ObjectId(userId)) : new ObjectId(userId),  // Use device userId if exists, otherwise use request userId
      action,
      parameters: validatedParams,
      status: 'sent',  // Set to 'sent' immediately so ESP32 can pick it up on next poll (200ms)
      createdAt: now,
      sentAt: now,  // Mark as sent immediately
      completedAt: null,
      response: null
    };

    const result = await commandsCollection.insertOne(command);

    // Log the action
    console.log(`Control command sent - Device: ${deviceId}, Action: ${action}, Params:`, validatedParams);

    return NextResponse.json({
      message: 'Control command sent successfully',
      commandId: result.insertedId,
      action,
      parameters: validatedParams
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Device control error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      deviceId,
      macAddress,
      action
    });
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// GET: Get command history for devices
export async function GET(request) {
  try {
    const decoded = verifyUserToken(request);
    const userId = decoded.userId;

    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const commandsCollection = db.collection('control_commands');

    let query = { userId: new ObjectId(userId) };

    if (deviceId) {
      // Verify user owns this device
      const device = await devicesCollection.findOne({
        _id: new ObjectId(deviceId),
        userId: new ObjectId(userId)
      });
      
      if (!device) {
        return NextResponse.json(
          { error: 'Device not found or access denied' },
          { status: 404 }
        );
      }
      
      query.deviceId = new ObjectId(deviceId);
    }

    // Fetch command history
    const commands = await commandsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      commands
    }, { status: 200 });

  } catch (error) {
    console.error('Get commands error:', error);
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// ESP32 devices can poll for pending commands
export async function PATCH(request) {
  try {
    // Device authentication
    const deviceKey = request.headers.get('x-device-key');
    const macAddress = request.headers.get('x-device-mac');
    
    console.log('🔵 PATCH /api/devices/control - Device polling:', {
      hasKey: !!deviceKey,
      mac: macAddress?.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    });
    
    if (!deviceKey || !macAddress) {
      console.log('❌ Missing authentication headers');
      return NextResponse.json(
        { error: 'Device authentication required', hint: 'Include x-device-key and x-device-mac headers' },
        { status: 401 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const commandsCollection = db.collection('control_commands');
    const deviceDataCollection = db.collection('iot_device_data');

    // Normalize MAC address (remove colons/dashes, uppercase)
    const cleanMac = macAddress.replace(/[:-]/g, '').toUpperCase();
    console.log('📡 PATCH request - MAC address:', { original: macAddress, cleaned: cleanMac });
    
    // Validate MAC address (but allow it to continue for now - device might not have MAC yet)
    if (!cleanMac || cleanMac.length < 12) {
      console.warn('⚠️ Invalid MAC address format:', cleanMac);
      // Don't fail - device might be registering
    }

    // Find device by MAC address - try multiple formats
    let device = await devicesCollection.findOne({ 
      macAddress: cleanMac 
    });
    
    // If not found, try with colons
    if (!device) {
      const colonMac = cleanMac.replace(/(.{2})/g, '$1:').slice(0, -1);
      device = await devicesCollection.findOne({ 
        macAddress: colonMac 
      });
    }
    
    // If still not found, try case-insensitive search
    if (!device) {
      const allDevices = await devicesCollection.find({}).toArray();
      device = allDevices.find(d => {
        if (!d.macAddress) return false;
        const dbMac = d.macAddress.replace(/[:-]/g, '').toUpperCase();
        return dbMac === cleanMac;
      });
    }

    // For testing: Auto-register device if not found
    if (!device) {
      console.log('⚠️ Device not found, auto-registering for testing:', cleanMac);
      
      // Create a temporary device entry for testing
      const tempDevice = {
        macAddress: cleanMac,  // Store without colons for consistency
        deviceName: `ESP32_${cleanMac.substring(0, 8)}`,
        deviceType: 'ESP32_Laser',
        location: 'Test',
        status: 'online',
        firmwareVersion: '1.0.0',
        lastSeen: new Date(),
        isTestDevice: true,  // Mark as test device
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await devicesCollection.insertOne(tempDevice);
      device = {
        _id: insertResult.insertedId,
        ...tempDevice
      };
      
      console.log('✅ Auto-registered test device:', device._id, 'MAC:', cleanMac);
    } else {
      // Update lastSeen timestamp
      await devicesCollection.updateOne(
        { _id: device._id },
        { $set: { lastSeen: new Date(), status: 'online' } }
      );
      console.log('✅ Found device:', device._id, 'MAC:', device.macAddress);
    }

    // Get pending commands for this device (only get the latest one to avoid duplicates)
    const pendingCommands = await commandsCollection
      .find({
        deviceId: device._id,
        status: { $in: ['pending', 'sent'] }
      })
      .sort({ createdAt: -1 })  // Get newest first
      .limit(1)  // Only get the latest command
      .toArray();

    // Also get the latest laser state from device data
    let currentLaserState = null;
    try {
      const latestData = await deviceDataCollection
        .findOne(
          { 
            $or: [
              { deviceId: device.deviceId || device._id.toString() },
              { deviceMAC: cleanMac }
            ],
            laserState: { $exists: true }
          },
          { sort: { receivedAt: -1 } }
        );
      
      if (latestData) {
        currentLaserState = latestData.laserState === 'on' || latestData.laserState === true ? 'on' : 'off';
        console.log(`📊 Current laser state from device data: ${currentLaserState}`);
      } else {
        console.log(`📊 No laser state data found for device ${device._id}`);
      }
    } catch (error) {
      console.error('Error fetching laser state:', error);
      // Don't fail the request if state fetch fails
    }

    // Mark command as delivered (but don't mark as completed yet - ESP32 will do that)
    if (pendingCommands.length > 0) {
      const command = pendingCommands[0];
      await commandsCollection.updateOne(
        { _id: command._id },
        { 
          $set: { 
            status: 'delivered',
            deliveredAt: new Date()
          }
        }
      );
      console.log(`📨 Marked command ${command._id} as delivered - Action: ${command.action}`);
    }

    console.log(`✅ Returning ${pendingCommands.length} command(s) to device`);
    if (pendingCommands.length > 0) {
      console.log(`📨 Commands:`, pendingCommands.map(c => ({ action: c.action, id: c._id })));
    }

    return NextResponse.json({
      commands: pendingCommands.map(cmd => ({
        _id: cmd._id,
        action: cmd.action,
        parameters: cmd.parameters || {},
        createdAt: cmd.createdAt
      })),
      deviceId: device._id.toString(),
      laserState: currentLaserState, // Include current laser state
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Device poll error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        commands: [],
        laserState: null
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
