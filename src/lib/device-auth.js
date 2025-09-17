import { connectToDatabase } from './mongodb';

// Middleware to authenticate device access
export async function authenticateDevice(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get device ID from request
    const deviceId = request.headers.get('x-device-id') || 
                    new URL(request.url).searchParams.get('deviceId');
    
    if (!deviceId) {
      return {
        authenticated: false,
        error: 'Device ID required'
      };
    }
    
    // Check if device exists and get its owner
    const device = await db.collection('user_devices').findOne({ deviceId });
    
    if (!device) {
      return {
        authenticated: false,
        error: 'Device not found or not registered'
      };
    }
    
    // Update device last seen
    await db.collection('user_devices').updateOne(
      { deviceId },
      { $set: { lastSeen: new Date(), status: 'online' } }
    );
    
    return {
      authenticated: true,
      device: device,
      userId: device.userId
    };
    
  } catch (error) {
    console.error('❌ Device authentication error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

// Middleware to authenticate user access
export async function authenticateUser(request) {
  try {
    // Get user token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return {
        authenticated: false,
        error: 'Authentication token required'
      };
    }
    
    // In a real app, you would validate the JWT token here
    // For now, we'll simulate user authentication
    // You can integrate with your existing auth system
    
    // For demo purposes, let's assume we have a valid user
    const userId = 'demo-user-123'; // This should come from token validation
    
    return {
      authenticated: true,
      userId: userId
    };
    
  } catch (error) {
    console.error('❌ User authentication error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

// Helper function to add user ID to request headers
export function addUserIdToHeaders(request, userId) {
  const headers = new Headers(request.headers);
  headers.set('x-user-id', userId);
  return headers;
}
