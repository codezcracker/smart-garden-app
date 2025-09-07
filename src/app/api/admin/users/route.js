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

    // Fetch all users (excluding password hashes)
    const users = await usersCollection.find(
      {},
      { projection: { passwordHash: 0 } }
    ).toArray();

    // Format user data
    const formattedUsers = users.map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      homeAddress: user.homeAddress,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      isVerified: user.isVerified,
      devices: user.devices || [],
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
