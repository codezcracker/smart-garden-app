const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// MongoDB Atlas connection - Fixed format
const MONGODB_URI = 'mongodb+srv://codezcracker:Ars%401234@atlascluster.fs3ipnn.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const DB_NAME = 'smartGardenDB';
const COLLECTION_NAME = 'plants';

async function migrateToMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Clear existing data
    console.log('🗑️  Clearing existing plant data...');
    await collection.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Create sample plant data
    console.log('🌱 Creating sample plant data...');
    const samplePlants = [
      {
        id: '1',
        scientificName: 'Daucus carota',
        commonName: 'Carrot',
        emoji: '🥕',
        category: 'Vegetable',
        family: 'Apiaceae',
        plantType: 'Root Vegetable',
        climate: 'Temperate',
        difficulty: 'Easy',
        growthTime: '70-80 days',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Full Sun',
        matureHeight: '6-12 inches',
        soilType: 'Well-drained',
        primaryUse: 'Food'
      },
      {
        id: '2',
        scientificName: 'Lycopersicon esculentum',
        commonName: 'Tomato',
        emoji: '🍅',
        category: 'Vegetable',
        family: 'Solanaceae',
        plantType: 'Fruiting Vegetable',
        climate: 'Warm',
        difficulty: 'Medium',
        growthTime: '75-85 days',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Full Sun',
        matureHeight: '3-6 feet',
        soilType: 'Rich, well-drained',
        primaryUse: 'Food'
      },
      {
        id: '3',
        scientificName: 'Rosa',
        commonName: 'Rose',
        emoji: '🌹',
        category: 'Flower',
        family: 'Rosaceae',
        plantType: 'Flowering Shrub',
        climate: 'Temperate',
        difficulty: 'Medium',
        growthTime: '2-3 years',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Full Sun to Partial Shade',
        matureHeight: '2-6 feet',
        soilType: 'Well-drained, fertile',
        primaryUse: 'Ornamental'
      },
      {
        id: '4',
        scientificName: 'Mentha',
        commonName: 'Mint',
        emoji: '🌿',
        category: 'Herb',
        family: 'Lamiaceae',
        plantType: 'Perennial Herb',
        climate: 'Temperate',
        difficulty: 'Easy',
        growthTime: '60-90 days',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Partial Shade',
        matureHeight: '1-2 feet',
        soilType: 'Moist, well-drained',
        primaryUse: 'Culinary'
      },
      {
        id: '5',
        scientificName: 'Citrus limon',
        commonName: 'Lemon',
        emoji: '🍋',
        category: 'Fruit',
        family: 'Rutaceae',
        plantType: 'Citrus Tree',
        climate: 'Warm',
        difficulty: 'Medium',
        growthTime: '3-5 years',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Full Sun',
        matureHeight: '10-20 feet',
        soilType: 'Well-drained, slightly acidic',
        primaryUse: 'Food'
      },
      {
        id: '6',
        scientificName: 'Lactuca sativa',
        commonName: 'Lettuce',
        emoji: '🥬',
        category: 'Vegetable',
        family: 'Asteraceae',
        plantType: 'Leafy Green',
        climate: 'Cool',
        difficulty: 'Easy',
        growthTime: '45-65 days',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Partial Shade',
        matureHeight: '6-12 inches',
        soilType: 'Well-drained, fertile',
        primaryUse: 'Food'
      },
      {
        id: '7',
        scientificName: 'Cucumis sativus',
        commonName: 'Cucumber',
        emoji: '🥒',
        category: 'Vegetable',
        family: 'Cucurbitaceae',
        plantType: 'Vining Vegetable',
        climate: 'Warm',
        difficulty: 'Easy',
        growthTime: '50-70 days',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Full Sun',
        matureHeight: '1-3 feet',
        soilType: 'Well-drained, fertile',
        primaryUse: 'Food'
      },
      {
        id: '8',
        scientificName: 'Capsicum annuum',
        commonName: 'Bell Pepper',
        emoji: '🫑',
        category: 'Vegetable',
        family: 'Solanaceae',
        plantType: 'Fruiting Vegetable',
        climate: 'Warm',
        difficulty: 'Medium',
        growthTime: '70-90 days',
        wateringFrequency: 'Regular',
        sunlightNeeds: 'Full Sun',
        matureHeight: '2-3 feet',
        soilType: 'Well-drained, fertile',
        primaryUse: 'Food'
      }
    ];
    
    // Insert sample data
    console.log(`📝 Inserting ${samplePlants.length} sample plants...`);
    const result = await collection.insertMany(samplePlants);
    console.log(`✅ Inserted ${result.insertedCount} plants`);
    
    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    await collection.createIndex({ commonName: 'text', scientificName: 'text' });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ family: 1 });
    await collection.createIndex({ climate: 1 });
    await collection.createIndex({ difficulty: 1 });
    console.log('✅ Indexes created');
    
    // Verify data
    const count = await collection.countDocuments();
    console.log(`📊 Total plants in database: ${count}`);
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Run migration
migrateToMongoDB();
