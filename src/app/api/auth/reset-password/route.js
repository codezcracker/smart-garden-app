import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { sendPasswordResetEmail } from '../../../../lib/email-service';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { email, newPassword, resetToken } = await request.json();

    // Validate input
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // If resetToken is provided, verify it
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded.email !== email || decoded.type !== 'password_reset') {
          return NextResponse.json(
            { error: 'Invalid reset token' },
            { status: 401 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 401 }
        );
      }
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          passwordHash: passwordHash,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'Password reset successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// For requesting password reset (generates reset token)
export async function PUT(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('smartGardenDB');
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent'
      }, { status: 200 });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { 
        userId: user._id,
        email: email,
        type: 'password_reset'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, resetUrl);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Still return success to user (security: don't reveal if email exists)
      // But log the error for debugging
    }

    // Don't return the token/URL in production for security
    // Only return success message
    return NextResponse.json({
      message: 'If the email exists, a password reset link has been sent to your email address.'
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}



