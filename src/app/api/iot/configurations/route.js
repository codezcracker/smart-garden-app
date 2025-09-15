import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || ''; // 'current' or 'future'
    const status = searchParams.get('status') || '';
    
    console.log(`🔍 IoT Configurations API: type=${type}, status=${status}`);
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const configurationsCollection = db.collection('device_configurations');
    const componentsCollection = db.collection('device_components');
    
    // Build query
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get configurations
    const configurations = await configurationsCollection.find(query).sort({ version: 1 }).toArray();
    
    // For each configuration, get detailed component information
    const configurationsWithComponents = await Promise.all(
      configurations.map(async (config) => {
        const componentIds = config.components || [];
        const components = await componentsCollection.find({ id: { $in: componentIds } }).toArray();
        
        return {
          ...config,
          componentDetails: components
        };
      })
    );
    
    console.log(`✅ Found ${configurations.length} configurations`);
    
    return NextResponse.json({
      success: true,
      configurations: configurationsWithComponents,
      total: configurations.length,
      metadata: {
        apiType: 'iot-configurations',
        database: 'smartGardenDB',
        collection: 'device_configurations'
      }
    });
    
  } catch (error) {
    console.error('IoT Configurations API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch IoT configurations',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, version, type, components, specifications } = body;
    
    console.log(`🔍 Creating new IoT configuration: ${name}`);
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('device_configurations');
    
    // Generate unique ID
    const id = `config_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${version}`;
    
    const newConfiguration = {
      id,
      name,
      description,
      version,
      type: type || 'current',
      components: components || [],
      specifications: specifications || {},
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert configuration
    const result = await collection.insertOne(newConfiguration);
    
    console.log(`✅ Created configuration with ID: ${result.insertedId}`);
    
    return NextResponse.json({
      success: true,
      configuration: newConfiguration,
      message: 'Configuration created successfully'
    });
    
  } catch (error) {
    console.error('IoT Configurations POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create IoT configuration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
