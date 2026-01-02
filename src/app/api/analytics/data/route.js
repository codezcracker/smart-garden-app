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

// GET: Get analytics data for user's devices
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month'; // month, quarter, year
    const deviceId = url.searchParams.get('deviceId'); // optional: filter by device

    await client.connect();
    const db = client.db('smartGardenDB');
    const devicesCollection = db.collection('devices');
    const sensorDataCollection = db.collection('sensor_readings');

    // Get user's devices
    let deviceQuery = { userId: new ObjectId(userId) };
    if (deviceId) {
      deviceQuery._id = new ObjectId(deviceId);
    }

    const devices = await devicesCollection.find(deviceQuery, {
      projection: { _id: 1, deviceName: 1 }
    }).toArray();

    if (devices.length === 0) {
      return NextResponse.json({
        stats: {
          totalPlants: 0,
          growthRate: 0,
          waterUsage: 0,
          healthScore: 0
        },
        growthData: [],
        plantHealthData: [],
        waterUsageData: [],
        recentActivity: []
      }, { status: 200 });
    }

    const deviceIds = devices.map(d => d._id);

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
    }

    // Get sensor readings for the period
    const readings = await sensorDataCollection.find({
      deviceId: { $in: deviceIds },
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 }).toArray();

    // Calculate statistics
    const stats = {
      totalPlants: devices.length, // Using device count as proxy for plants
      growthRate: 0,
      waterUsage: 0,
      healthScore: 0
    };

    // Calculate growth rate (based on device activity)
    const currentMonthReadings = readings.filter(r => {
      const readingDate = new Date(r.timestamp);
      return readingDate.getMonth() === now.getMonth() && readingDate.getFullYear() === now.getFullYear();
    });
    const lastMonthReadings = readings.filter(r => {
      const readingDate = new Date(r.timestamp);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return readingDate.getMonth() === lastMonth.getMonth() && readingDate.getFullYear() === lastMonth.getFullYear();
    });

    if (lastMonthReadings.length > 0) {
      const growth = ((currentMonthReadings.length - lastMonthReadings.length) / lastMonthReadings.length) * 100;
      stats.growthRate = Math.round(growth);
    }

    // Calculate water usage (sum of watering events or moisture changes)
    const waterReadings = readings.filter(r => r.sensorType === 'soil_moisture');
    // Estimate water usage based on moisture level changes
    let totalWaterUsage = 0;
    for (let i = 1; i < waterReadings.length; i++) {
      const diff = waterReadings[i].value - waterReadings[i - 1].value;
      if (diff > 0) {
        totalWaterUsage += diff * 0.5; // Rough estimate: 0.5L per % increase
      }
    }
    stats.waterUsage = Math.round(totalWaterUsage);

    // Calculate health score (based on sensor readings within optimal ranges)
    const optimalRanges = {
      soil_moisture: { min: 40, max: 80 },
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 70 },
      light_level: { min: 30, max: 90 }
    };

    let healthyReadings = 0;
    let totalReadings = 0;

    readings.forEach(reading => {
      const range = optimalRanges[reading.sensorType];
      if (range) {
        totalReadings++;
        if (reading.value >= range.min && reading.value <= range.max) {
          healthyReadings++;
        }
      }
    });

    stats.healthScore = totalReadings > 0 ? Math.round((healthyReadings / totalReadings) * 100) : 0;

    // Generate growth data (monthly aggregation)
    const growthData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthReadings = readings.filter(r => {
        const readingDate = new Date(r.timestamp);
        return readingDate.getMonth() === date.getMonth() && readingDate.getFullYear() === date.getFullYear();
      });
      
      growthData.push({
        month: months[date.getMonth()],
        growth: monthReadings.length > 0 ? Math.round((monthReadings.length / 100) * 10) : 0,
        plants: devices.length
      });
    }

    // Plant health distribution
    const latestReadings = await sensorDataCollection.aggregate([
      { $match: { deviceId: { $in: deviceIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$deviceId',
          latestReading: { $first: '$$ROOT' }
        }
      }
    ]).toArray();

    let excellent = 0, good = 0, needsAttention = 0;

    latestReadings.forEach(({ latestReading }) => {
      const range = optimalRanges[latestReading.sensorType];
      if (range) {
        const value = latestReading.value;
        if (value >= range.min && value <= range.max) {
          excellent++;
        } else if (Math.abs(value - (range.min + range.max) / 2) < (range.max - range.min) * 0.3) {
          good++;
        } else {
          needsAttention++;
        }
      }
    });

    const totalDevices = latestReadings.length || 1;
    const plantHealthData = [
      { name: 'Excellent', count: excellent, percentage: Math.round((excellent / totalDevices) * 100), color: 'excellent' },
      { name: 'Good', count: good, percentage: Math.round((good / totalDevices) * 100), color: 'good' },
      { name: 'Needs Attention', count: needsAttention, percentage: Math.round((needsAttention / totalDevices) * 100), color: 'warning' }
    ];

    // Weekly water usage data
    const waterUsageData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Start of week (Monday)

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      
      const dayReadings = waterReadings.filter(r => {
        const readingDate = new Date(r.timestamp);
        return readingDate.toDateString() === dayDate.toDateString();
      });

      let dayUsage = 0;
      for (let j = 1; j < dayReadings.length; j++) {
        const diff = dayReadings[j].value - dayReadings[j - 1].value;
        if (diff > 0) {
          dayUsage += diff * 0.5;
        }
      }

      waterUsageData.push({
        day: days[i],
        usage: Math.round(dayUsage)
      });
    }

    // Recent activity (last 10 sensor readings)
    const recentActivity = await sensorDataCollection.find({
      deviceId: { $in: deviceIds }
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();

    const activityList = recentActivity.map(reading => {
      const device = devices.find(d => d._id.toString() === reading.deviceId.toString());
      let activityType = 'Data Update';
      let description = `${reading.sensorType}: ${reading.value}${reading.unit || ''}`;

      if (reading.sensorType === 'soil_moisture' && reading.value < 30) {
        activityType = 'Health Alert';
        description = `${device?.deviceName || 'Device'} needs water`;
      }

      return {
        type: activityType,
        description,
        deviceName: device?.deviceName || 'Unknown Device',
        timestamp: reading.timestamp
      };
    });

    return NextResponse.json({
      stats,
      growthData,
      plantHealthData,
      waterUsageData,
      recentActivity: activityList
    }, { status: 200 });

  } catch (error) {
    console.error('Analytics API error:', error);
    
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




