import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { email, password, firstName, lastName, homeAddress } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName || !homeAddress) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    // Check if super admin already exists
    const existingSuperAdmin = await usersCollection.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'Super admin already exists. Only one super admin is allowed.' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create super admin user
    const superAdmin = {
      email,
      passwordHash,
      firstName,
      lastName,
      homeAddress,
      subscriptionPlan: 'premium',
      role: 'super_admin',
      isVerified: true,
      managedUsers: [],
      assignedBy: null,
      devices: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(superAdmin);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId,
        email: email,
        role: 'super_admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (without password hash)
    const userResponse = {
      id: result.insertedId,
      email,
      firstName,
      lastName,
      homeAddress,
      subscriptionPlan: 'premium',
      role: 'super_admin',
      managedUsers: [],
      assignedBy: null
    };

    return NextResponse.json({
      message: 'Super admin created successfully',
      user: userResponse,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Super admin setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
