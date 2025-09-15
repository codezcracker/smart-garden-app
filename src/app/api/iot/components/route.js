import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || ''; // 'current' or 'future'
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    
    console.log(`🔍 IoT Components API: type=${type}, category=${category}, status=${status}`);
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('device_components');
    
    // Build query
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get components
    const components = await collection.find(query).sort({ priority: 1, category: 1 }).toArray();
    
    // Group by category for better organization
    const groupedComponents = components.reduce((acc, component) => {
      const category = component.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(component);
      return acc;
    }, {});
    
    console.log(`✅ Found ${components.length} components`);
    
    return NextResponse.json({
      success: true,
      components: components,
      groupedComponents: groupedComponents,
      total: components.length,
      metadata: {
        apiType: 'iot-components',
        database: 'smartGardenDB',
        collection: 'device_components'
      }
    });
    
  } catch (error) {
    console.error('IoT Components API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch IoT components',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, name, description, type, specifications, priority = 1 } = body;
    
    console.log(`🔍 Creating new IoT component: ${name}`);
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('device_components');
    
    // Generate unique ID
    const id = `${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    const newComponent = {
      id,
      category,
      name,
      description,
      type: type || 'current',
      specifications: specifications || {},
      status: 'active',
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert component
    const result = await collection.insertOne(newComponent);
    
    console.log(`✅ Created component with ID: ${result.insertedId}`);
    
    return NextResponse.json({
      success: true,
      component: newComponent,
      message: 'Component created successfully'
    });
    
  } catch (error) {
    console.error('IoT Components POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create IoT component',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
