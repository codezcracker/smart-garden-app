import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    await client.connect();
    const db = client.db('smart_garden_iot');
    const usersCollection = db.collection('users');

    // Check if demo user already exists
    const existingUser = await usersCollection.findOne({ email: 'demo@smartgarden.com' });
    if (existingUser) {
      return NextResponse.json({
        message: 'Demo user already exists'
      }, { status: 200 });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('demo123456', saltRounds);

    // Create demo user
    const demoUser = {
      email: 'demo@smartgarden.com',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      homeAddress: '123 Smart Garden Street, IoT City, Tech State 12345',
      subscriptionPlan: 'premium',
      role: 'user',
      isVerified: true,
      devices: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(demoUser);

    // Create a demo device for the user
    const devicesCollection = db.collection('devices');
    const demoDevice = {
      userId: result.insertedId,
      deviceName: 'Demo Garden Controller',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      deviceType: 'ESP32_CONTROLLER',
      location: 'Backyard Garden',
      status: 'online',
      firmwareVersion: '1.0.0',
      lastSeen: new Date(),
      sensors: {
        soilMoisture: { enabled: true, calibration: { min: 0, max: 1024 } },
        temperature: { enabled: true, calibration: { offset: 0 } },
        humidity: { enabled: true, calibration: { offset: 0 } },
        lightLevel: { enabled: true, calibration: { min: 0, max: 1024 } }
      },
      actuators: {
        waterPump: { enabled: true, settings: { maxDuration: 300 } },
        ledLights: { enabled: true, settings: { brightness: 80 } }
      },
      automationRules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const deviceResult = await devicesCollection.insertOne(demoDevice);

    // Add device to user's device list
    await usersCollection.updateOne(
      { _id: result.insertedId },
      { 
        $push: { devices: deviceResult.insertedId },
        $set: { updatedAt: new Date() }
      }
    );

    // Create some demo sensor data
    const sensorDataCollection = db.collection('sensor_readings');
    const now = new Date();
    const demoReadings = [
      {
        deviceId: deviceResult.insertedId,
        timestamp: now,
        sensorType: 'soil_moisture',
        value: 65,
        unit: 'percentage',
        rawValue: 650
      },
      {
        deviceId: deviceResult.insertedId,
        timestamp: now,
        sensorType: 'temperature',
        value: 24.5,
        unit: 'celsius',
        rawValue: 24.5
      },
      {
        deviceId: deviceResult.insertedId,
        timestamp: now,
        sensorType: 'humidity',
        value: 60,
        unit: 'percentage',
        rawValue: 60
      },
      {
        deviceId: deviceResult.insertedId,
        timestamp: now,
        sensorType: 'light_level',
        value: 75,
        unit: 'percentage',
        rawValue: 750
      },
      {
        deviceId: deviceResult.insertedId,
        timestamp: now,
        sensorType: 'battery_level',
        value: 85,
        unit: 'percentage',
        rawValue: 85
      }
    ];

    await sensorDataCollection.insertMany(demoReadings);

    return NextResponse.json({
      message: 'Demo user and device created successfully',
      user: {
        id: result.insertedId,
        email: 'demo@smartgarden.com',
        firstName: 'Demo',
        lastName: 'User'
      },
      device: {
        id: deviceResult.insertedId,
        name: 'Demo Garden Controller'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Demo setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
