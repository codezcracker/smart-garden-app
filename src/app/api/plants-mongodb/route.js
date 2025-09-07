import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const family = searchParams.get('family') || '';
    const category = searchParams.get('category') || '';
    const climate = searchParams.get('climate') || '';
    const difficulty = searchParams.get('difficulty') || '';

    console.log(`🔍 MongoDB Plants API: page=${page}, limit=${limit}, search="${search}"`);

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    // Use the correct collection name that contains 390k records
    const collection = db.collection('plants_collection');

    // Build query
    let query = {};
    
    // Text search
    if (search) {
      query.$or = [
        { commonName: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { family: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by family
    if (family) {
      query.family = { $regex: family, $options: 'i' };
    }
    
    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Filter by climate
    if (climate) {
      query.climate = { $regex: climate, $options: 'i' };
    }
    
    // Filter by difficulty
    if (difficulty) {
      query.difficulty = { $regex: difficulty, $options: 'i' };
    }

    // Get total count
    const total = await collection.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get plants with pagination
    const plants = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✅ MongoDB Plants API: Found ${plants.length} plants in ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      plants: plants,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      },
      performance: {
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      },
      metadata: {
        totalPlants: total,
        apiType: 'mongodb-atlas',
        dataSource: 'MongoDB Atlas Database',
        database: 'smartGardenDB',
        collection: 'plants_collection'
      }
    });

  } catch (error) {
    console.error('MongoDB Plants API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch plants from MongoDB',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
