import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('📍 MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
    
    const { db } = await connectToDatabase();
    console.log('✅ MongoDB connected successfully');
    
    // Test a simple query
    const testResult = await db.admin().ping();
    console.log('🏓 MongoDB ping result:', testResult);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      uri_configured: !!process.env.MONGODB_URI,
      ping_result: testResult
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      uri_configured: !!process.env.MONGODB_URI,
      uri_length: process.env.MONGODB_URI?.length || 0
    }, { status: 500 });
  }
}
