import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/iot/gardens - Get gardens for authenticated user
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get user ID from request headers (set by auth middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get gardens belonging to this user
    const gardens = await db.collection('gardens').find({ userId }).toArray();
    
    // Get device count for each garden
    const gardensWithStats = await Promise.all(
      gardens.map(async (garden) => {
        const deviceCount = await db.collection('user_devices').countDocuments({ 
          gardenId: garden.gardenId 
        });
        
        const onlineDevices = await db.collection('user_devices').countDocuments({ 
          gardenId: garden.gardenId,
          status: 'online'
        });
        
        return {
          ...garden,
          deviceCount,
          onlineDevices,
          offlineDevices: deviceCount - onlineDevices
        };
      })
    );
    
    console.log('🌱 Gardens API: Retrieved', gardensWithStats.length, 'gardens for user', userId);
    
    return NextResponse.json({
      success: true,
      gardens: gardensWithStats
    });
    
  } catch (error) {
    console.error('❌ Error fetching gardens:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch gardens'
    }, { status: 500 });
  }
}

// POST /api/iot/gardens - Create new garden for authenticated user
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const gardenData = await request.json();
    
    // Validate required fields
    if (!gardenData.gardenName || !gardenData.location) {
      return NextResponse.json({
        success: false,
        error: 'Garden name and location are required'
      }, { status: 400 });
    }
    
    // Generate unique garden ID
    const gardenId = `GARDEN_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create garden document
    const gardenDocument = {
      userId: userId,
      gardenId: gardenId,
      gardenName: gardenData.gardenName,
      location: gardenData.location,
      area: gardenData.area || '',
      description: gardenData.description || '',
      gardenType: gardenData.gardenType || 'Indoor',
      
      // Network configuration (shared by all devices in this garden)
      network: {
        wifiSSID: gardenData.wifiSSID || '',
        wifiPassword: gardenData.wifiPassword || '',
        serverURL: gardenData.serverURL || 'http://192.168.68.58:3000',
        backupServerURL: gardenData.backupServerURL || 'https://smart-garden-app.vercel.app'
      },
      
      // Garden settings
      settings: {
        timezone: gardenData.timezone || 'UTC',
        units: gardenData.units || 'metric', // metric or imperial
        dataRetentionDays: gardenData.dataRetentionDays || 30,
        alertThresholds: {
          temperature: {
            min: gardenData.tempMin || 15,
            max: gardenData.tempMax || 35
          },
          humidity: {
            min: gardenData.humidityMin || 30,
            max: gardenData.humidityMax || 80
          },
          soilMoisture: {
            min: gardenData.soilMin || 20,
            max: gardenData.soilMax || 80
          }
        }
      },
      
      // Status and metadata
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert garden
    const result = await db.collection('gardens').insertOne(gardenDocument);
    
    console.log('🌱 Gardens API: Created garden', gardenId, 'for user', userId);
    
    return NextResponse.json({
      success: true,
      message: 'Garden created successfully',
      garden: {
        _id: result.insertedId,
        gardenId: gardenId,
        gardenName: gardenData.gardenName,
        location: gardenData.location,
        status: 'active'
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating garden:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create garden'
    }, { status: 500 });
  }
}
