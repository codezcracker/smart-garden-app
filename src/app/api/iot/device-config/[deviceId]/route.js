import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/iot/device-config/[deviceId] - Get device configuration for ESP8266
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { deviceId } = params;
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }
    
    // Get device configuration
    const device = await db.collection('devices').findOne({ deviceId });
    
    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device configuration not found'
      }, { status: 404 });
    }
    
    // Return configuration in ESP8266-friendly format
    const config = {
      success: true,
      deviceId: device.deviceId,
      deviceName: device.deviceName || device.deviceId,
      location: device.location || '',
      description: device.description || '',
      wifi: {
        ssid: device.wifiSSID || '',
        password: device.wifiPassword || ''
      },
      sensors: device.sensors || {
        temperature: true,
        humidity: true,
        lightLevel: true,
        soilMoisture: true
      },
      server: {
        local: 'http://192.168.68.58:3000',
        deployed: 'https://smart-garden-4l28rdvnu-codezs-projects.vercel.app'
      },
      settings: {
        sendInterval: 1000, // 1 second
        reconnectAttempts: 3,
        timeout: 5000
      },
      lastUpdated: device.updatedAt || device.createdAt,
      configUpdateRequested: device.configUpdateRequested || false,
      lastConfigUpdateRequest: device.lastConfigUpdateRequest || null
    };
    
    // Clear the config update requested flag since we're sending the config
    if (device.configUpdateRequested) {
      await db.collection('devices').updateOne(
        { deviceId },
        { 
          $unset: { 
            configUpdateRequested: "",
            lastConfigUpdateRequest: ""
          }
        }
      );
      console.log('🔄 Device Config API: Cleared force update flag for', deviceId);
    }
    
    console.log('📱 Device Config API: Sending config for', deviceId);
    
    return NextResponse.json(config);
    
  } catch (error) {
    console.error('❌ Error fetching device config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch device configuration'
    }, { status: 500 });
  }
}
