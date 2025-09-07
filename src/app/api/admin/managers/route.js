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

    // Check if user is super admin
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin role required.' },
        { status: 403 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    // Fetch all managers (excluding password hashes)
    const managers = await usersCollection.find(
      { role: 'manager' },
      { projection: { passwordHash: 0 } }
    ).toArray();

    // Format manager data
    const formattedManagers = managers.map(manager => ({
      _id: manager._id,
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      homeAddress: manager.homeAddress,
      subscriptionPlan: manager.subscriptionPlan,
      isVerified: manager.isVerified,
      managedUsers: manager.managedUsers || [],
      assignedBy: manager.assignedBy,
      devices: manager.devices || [],
      createdAt: manager.createdAt,
      lastLogin: manager.lastLogin
    }));

    return NextResponse.json({
      managers: formattedManagers,
      total: formattedManagers.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching managers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
