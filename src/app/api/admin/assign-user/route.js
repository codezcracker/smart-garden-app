import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function POST(request) {
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

    const { userId, managerId } = await request.json();

    if (!userId || !managerId) {
      return NextResponse.json(
        { error: 'User ID and Manager ID are required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    // Verify user exists and is a regular user
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId),
      role: 'user'
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or not a regular user' },
        { status: 404 }
      );
    }

    // Verify manager exists and is a manager
    const manager = await usersCollection.findOne({ 
      _id: new ObjectId(managerId),
      role: 'manager'
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Manager not found or not a manager' },
        { status: 404 }
      );
    }

    // Check if user is already assigned to a manager
    const existingAssignment = await usersCollection.findOne({
      managedUsers: { $in: [new ObjectId(userId)] }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'User is already assigned to a manager' },
        { status: 409 }
      );
    }

    // Add user to manager's managedUsers array
    await usersCollection.updateOne(
      { _id: new ObjectId(managerId) },
      { 
        $addToSet: { managedUsers: new ObjectId(userId) },
        $set: { updatedAt: new Date() }
      }
    );

    // Update user's assignedBy field
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          assignedBy: new ObjectId(managerId),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'User successfully assigned to manager',
      userId: userId,
      managerId: managerId
    }, { status: 200 });

  } catch (error) {
    console.error('Error assigning user to manager:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request) {
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

    const { userId, managerId } = await request.json();

    if (!userId || !managerId) {
      return NextResponse.json(
        { error: 'User ID and Manager ID are required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    // Remove user from manager's managedUsers array
    await usersCollection.updateOne(
      { _id: new ObjectId(managerId) },
      { 
        $pull: { managedUsers: new ObjectId(userId) },
        $set: { updatedAt: new Date() }
      }
    );

    // Clear user's assignedBy field
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $unset: { assignedBy: "" },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      message: 'User successfully unassigned from manager',
      userId: userId,
      managerId: managerId
    }, { status: 200 });

  } catch (error) {
    console.error('Error unassigning user from manager:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
