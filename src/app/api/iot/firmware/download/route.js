import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

/**
 * Firmware Download API
 * Serves firmware binary files for OTA updates
 */

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const firmwareId = searchParams.get('id');
    const version = searchParams.get('version');

    if (!firmwareId && !version) {
      return NextResponse.json({
        error: 'Firmware ID or version is required'
      }, { status: 400 });
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const firmwareCollection = db.collection('firmware_updates');

    // Find firmware
    const firmware = firmwareId
      ? await firmwareCollection.findOne({ _id: new ObjectId(firmwareId) })
      : await firmwareCollection.findOne({ version: version, isActive: true });

    if (!firmware) {
      return NextResponse.json({
        error: 'Firmware not found'
      }, { status: 404 });
    }

    // Check if file exists
    if (!fs.existsSync(firmware.filepath)) {
      return NextResponse.json({
        error: 'Firmware file not found on server'
      }, { status: 404 });
    }

    // Read firmware file
    const firmwareBuffer = fs.readFileSync(firmware.filepath);

    // Return firmware binary
    return new NextResponse(firmwareBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${firmware.filename}"`,
        'Content-Length': firmware.size.toString(),
        'X-Firmware-Version': firmware.version,
        'X-Firmware-Checksum': firmware.checksum
      }
    });

  } catch (error) {
    console.error('Error downloading firmware:', error);
    return NextResponse.json({
      error: 'Failed to download firmware: ' + error.message
    }, { status: 500 });
  } finally {
    await client.close();
  }
}




