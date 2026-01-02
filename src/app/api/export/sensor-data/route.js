import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Middleware to verify JWT token
function verifyToken(request) {
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

// GET: Export sensor data as CSV or JSON
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sensorType = url.searchParams.get('sensorType');
    const format = url.searchParams.get('format') || 'json'; // json or csv
    const limit = parseInt(url.searchParams.get('limit')) || 10000; // Max 10k records

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const sensorDataCollection = db.collection('sensor_readings');

    // Build query
    let query = {};
    
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
    } else {
      // Get all user's devices
      const userDevices = await devicesCollection.find(
        { userId: new ObjectId(userId) },
        { projection: { _id: 1 } }
      ).toArray();
      
      query.deviceId = { $in: userDevices.map(d => d._id) };
    }

    // Add time range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Add sensor type filter
    if (sensorType) {
      query.sensorType = sensorType;
    }

    // Fetch sensor readings
    const readings = await sensorDataCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    // Get device names for better export
    const deviceIds = [...new Set(readings.map(r => r.deviceId.toString()))];
    const devices = await devicesCollection.find(
      { _id: { $in: deviceIds.map(id => new ObjectId(id)) } },
      { projection: { _id: 1, deviceName: 1, location: 1 } }
    ).toArray();

    const deviceMap = {};
    devices.forEach(d => {
      deviceMap[d._id.toString()] = { name: d.deviceName, location: d.location };
    });

    // Format data for export
    const exportData = readings.map(reading => ({
      timestamp: reading.timestamp,
      deviceId: reading.deviceId.toString(),
      deviceName: deviceMap[reading.deviceId.toString()]?.name || 'Unknown',
      location: deviceMap[reading.deviceId.toString()]?.location || 'Unknown',
      sensorType: reading.sensorType,
      value: reading.value,
      unit: reading.unit,
      rawValue: reading.rawValue
    }));

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Timestamp', 'Device ID', 'Device Name', 'Location', 'Sensor Type', 'Value', 'Unit', 'Raw Value'];
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => [
          new Date(row.timestamp).toISOString(),
          row.deviceId,
          `"${row.deviceName}"`,
          `"${row.location}"`,
          row.sensorType,
          row.value,
          row.unit,
          row.rawValue
        ].join(','))
      ];

      const csv = csvRows.join('\n');
      const filename = `sensor-data-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Return JSON
      return NextResponse.json({
        metadata: {
          exportedAt: new Date().toISOString(),
          totalRecords: exportData.length,
          deviceId: deviceId || 'all',
          startDate: startDate || null,
          endDate: endDate || null,
          sensorType: sensorType || 'all'
        },
        data: exportData
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

  } catch (error) {
    console.error('Export data error:', error);
    
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




