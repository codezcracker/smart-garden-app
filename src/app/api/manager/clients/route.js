import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is manager
    if (decoded.role !== 'manager') {
      return NextResponse.json(
        { error: 'Access denied. Manager role required.' },
        { status: 403 }
      );
    }

    await client.connect();
    const db = client.db('smart_garden_iot');
    const usersCollection = db.collection('users');

    // Get manager's assigned users
    const manager = await usersCollection.findOne(
      { _id: decoded.userId },
      { projection: { managedUsers: 1 } }
    );

    if (!manager) {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    // Fetch assigned users
    const assignedUserIds = manager.managedUsers || [];
    const clients = await usersCollection.find(
      { 
        _id: { $in: assignedUserIds },
        role: 'user' // Only get regular users, not other managers or super admins
      },
      { projection: { passwordHash: 0 } }
    ).toArray();

    // Format client data
    const formattedClients = clients.map(client => ({
      _id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      homeAddress: client.homeAddress,
      subscriptionPlan: client.subscriptionPlan,
      isVerified: client.isVerified,
      devices: client.devices || [],
      createdAt: client.createdAt,
      lastLogin: client.lastLogin
    }));

    return NextResponse.json({
      clients: formattedClients,
      total: formattedClients.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching manager clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
