import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * OTA Firmware Update API
 * Handles firmware upload, version management, and OTA update triggers
 */

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// GET: Get available firmware versions or check for updates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const currentVersion = searchParams.get('version');

    await client.connect();
    const db = client.db('smartGardenDB');
    const firmwareCollection = db.collection('firmware_updates');

    // Get latest firmware version
    const latestFirmware = await firmwareCollection
      .findOne(
        { isActive: true },
        { sort: { version: -1 } }
      );

    if (!latestFirmware) {
      return NextResponse.json({
        updateAvailable: false,
        message: 'No firmware available'
      }, { status: 200 });
    }

    // Check if device needs update
    if (deviceId && currentVersion) {
      const needsUpdate = compareVersions(currentVersion, latestFirmware.version) < 0;
      
      return NextResponse.json({
        updateAvailable: needsUpdate,
        currentVersion: currentVersion,
        latestVersion: latestFirmware.version,
        firmware: needsUpdate ? {
          version: latestFirmware.version,
          downloadUrl: `/api/iot/firmware/download?id=${latestFirmware._id}`,
          size: latestFirmware.size,
          checksum: latestFirmware.checksum,
          releaseNotes: latestFirmware.releaseNotes
        } : null
      }, { status: 200 });
    }

    // Return all active firmware versions
    const allFirmware = await firmwareCollection
      .find({ isActive: true })
      .sort({ version: -1 })
      .toArray();

    return NextResponse.json({
      firmware: allFirmware.map(f => ({
        id: f._id,
        version: f.version,
        size: f.size,
        uploadDate: f.uploadDate,
        releaseNotes: f.releaseNotes
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching firmware:', error);
    return NextResponse.json({
      error: 'Failed to fetch firmware information'
    }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST: Upload new firmware version
export async function POST(request) {
  try {
    const token = request.headers.get('Authorization');
    if (!token || !token.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const firmwareFile = formData.get('firmware');
    const version = formData.get('version');
    const releaseNotes = formData.get('releaseNotes') || '';

    if (!firmwareFile || !version) {
      return NextResponse.json({
        error: 'Missing required fields: firmware file and version'
      }, { status: 400 });
    }

    // Validate version format (e.g., "1.0.0")
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      return NextResponse.json({
        error: 'Invalid version format. Use semantic versioning (e.g., 1.0.0)'
      }, { status: 400 });
    }

    // Save firmware file
    const firmwareBuffer = Buffer.from(await firmwareFile.arrayBuffer());
    const firmwareDir = path.join(process.cwd(), 'firmware');
    
    // Create firmware directory if it doesn't exist
    if (!fs.existsSync(firmwareDir)) {
      fs.mkdirSync(firmwareDir, { recursive: true });
    }

    const filename = `firmware_${version}.bin`;
    const filepath = path.join(firmwareDir, filename);
    fs.writeFileSync(filepath, firmwareBuffer);

    // Calculate checksum (MD5 hash)
    const checksum = crypto.createHash('md5').update(firmwareBuffer).digest('hex');

    // Save firmware metadata to database
    await client.connect();
    const db = client.db('smartGardenDB');
    const firmwareCollection = db.collection('firmware_updates');

    const firmwareDoc = {
      version: version,
      filename: filename,
      filepath: filepath,
      size: firmwareBuffer.length,
      checksum: checksum,
      releaseNotes: releaseNotes,
      isActive: true,
      uploadDate: new Date(),
      uploader: 'admin' // TODO: Get from token
    };

    // Deactivate old firmware versions
    await firmwareCollection.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );

    // Insert new firmware
    const result = await firmwareCollection.insertOne(firmwareDoc);

    return NextResponse.json({
      success: true,
      message: 'Firmware uploaded successfully',
      firmware: {
        id: result.insertedId,
        version: version,
        size: firmwareBuffer.length,
        checksum: checksum
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error uploading firmware:', error);
    return NextResponse.json({
      error: 'Failed to upload firmware: ' + error.message
    }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PUT: Trigger OTA update for a device
export async function PUT(request) {
  try {
    const token = request.headers.get('Authorization');
    if (!token || !token.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { deviceId, firmwareVersion } = await request.json();

    if (!deviceId) {
      return NextResponse.json({
        error: 'Device ID is required'
      }, { status: 400 });
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const userDevicesCollection = db.collection('user_devices');
    const iotDevicesCollection = db.collection('iot_devices');
    const otaQueueCollection = db.collection('ota_queue');

    // Get device - check all possible collections
    let device = await devicesCollection.findOne({ deviceId: deviceId });
    
    if (!device) {
      device = await userDevicesCollection.findOne({ deviceId: deviceId });
    }
    
    if (!device) {
      device = await iotDevicesCollection.findOne({ deviceId: deviceId });
    }

    if (!device) {
      console.error('❌ Device not found in any collection:', deviceId);
      return NextResponse.json({
        error: 'Device not found'
      }, { status: 404 });
    }
    
    console.log('✅ Device found for OTA:', deviceId);

    // Get firmware version to update to
    const firmwareCollection = db.collection('firmware_updates');
    const firmware = firmwareVersion
      ? await firmwareCollection.findOne({ version: firmwareVersion, isActive: true })
      : await firmwareCollection.findOne({ isActive: true }, { sort: { version: -1 } });

    if (!firmware) {
      return NextResponse.json({
        error: 'Firmware not found'
      }, { status: 404 });
    }

    // Add to OTA queue
    const otaTask = {
      deviceId: deviceId,
      firmwareId: firmware._id,
      firmwareVersion: firmware.version,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await otaQueueCollection.insertOne(otaTask);

    // Update device to notify about pending update - update all collections
    const updateData = {
      $set: {
        pendingFirmwareUpdate: firmware.version,
        updateStatus: 'pending',
        lastUpdateCheck: new Date()
      }
    };
    
    await devicesCollection.updateOne({ deviceId: deviceId }, updateData);
    await userDevicesCollection.updateOne({ deviceId: deviceId }, updateData);
    await iotDevicesCollection.updateOne({ deviceId: deviceId }, updateData);
    
    console.log('✅ OTA update queued for device:', deviceId, 'version:', firmware.version);

    return NextResponse.json({
      success: true,
      message: 'OTA update queued successfully',
      otaTask: {
        deviceId: deviceId,
        firmwareVersion: firmware.version,
        status: 'pending'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error triggering OTA update:', error);
    return NextResponse.json({
      error: 'Failed to trigger OTA update: ' + error.message
    }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Helper function to compare version numbers
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
}

