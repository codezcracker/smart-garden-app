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

// GET: Get automation settings for user
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { automationSettings: 1, notificationSettings: 1 } }
    );

    // Default settings if not set
    const automationSettings = user?.automationSettings || {
      autoWatering: true,
      smartLighting: true,
      climateControl: false,
      notifications: true,
      dataSync: true
    };

    const notificationSettings = user?.notificationSettings || {
      wateringReminders: true,
      healthAlerts: true,
      growthUpdates: false,
      systemStatus: true
    };

    return NextResponse.json({
      automationSettings,
      notificationSettings
    }, { status: 200 });

  } catch (error) {
    console.error('Get automation settings error:', error);
    
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

// POST: Update automation settings for user
export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const { automationSettings, notificationSettings } = await request.json();

    if (!automationSettings && !notificationSettings) {
      return NextResponse.json(
        { error: 'At least one settings object is required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    const updateData = {
      updatedAt: new Date()
    };

    if (automationSettings) {
      updateData.automationSettings = automationSettings;
    }

    if (notificationSettings) {
      updateData.notificationSettings = notificationSettings;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({
      message: 'Automation settings updated successfully',
      automationSettings: automationSettings || undefined,
      notificationSettings: notificationSettings || undefined
    }, { status: 200 });

  } catch (error) {
    console.error('Update automation settings error:', error);
    
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




