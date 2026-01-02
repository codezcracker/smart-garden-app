import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import { getAutomationRules, updateAutomationRules } from '../../../../lib/automation-rules';

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

// GET: Get automation rules for a device
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');

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

    const rules = await getAutomationRules(deviceId);

    return NextResponse.json({
      rules,
      deviceId
    }, { status: 200 });

  } catch (error) {
    console.error('Get automation rules error:', error);
    
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

// POST: Create or update automation rules for a device
export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const { deviceId, rules } = await request.json();

    if (!deviceId || !rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: 'Device ID and rules array are required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');

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

    // Validate rules structure
    for (const rule of rules) {
      if (!rule.conditionType || !rule.action || rule.threshold === undefined) {
        return NextResponse.json(
          { error: 'Each rule must have conditionType, action, and threshold' },
          { status: 400 }
        );
      }
    }

    const result = await updateAutomationRules(deviceId, rules);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update automation rules' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Automation rules updated successfully',
      rules
    }, { status: 200 });

  } catch (error) {
    console.error('Update automation rules error:', error);
    
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




