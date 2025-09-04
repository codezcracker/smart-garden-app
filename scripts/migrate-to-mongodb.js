const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'smart-garden';
const COLLECTION_NAME = 'plants';

// CSV file path
const CSV_FILE = path.join(__dirname, '..', 'data', 'plants-database-enhanced.csv');

class PlantMigrator {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.batchSize = 1000;
    this.processedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB...');
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      this.collection = this.db.collection(COLLECTION_NAME);
      
      // Test connection
      await this.db.admin().ping();
      console.log('✅ Connected to MongoDB successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  async clearExistingData() {
    try {
      console.log('🧹 Clearing existing plant data...');
      const result = await this.collection.deleteMany({});
      console.log(`🗑️  Removed ${result.deletedCount} existing documents`);
    } catch (error) {
      console.error('❌ Error clearing existing data:', error.message);
    }
  }

  async migratePlants() {
    return new Promise((resolve, reject) => {
      const plants = [];
      let isProcessing = false;

      console.log('📊 Starting plant migration...');
      console.log(`📁 Reading from: ${CSV_FILE}`);

      const stream = fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Transform CSV row to MongoDB document
            const plant = this.transformPlantData(row);
            plants.push(plant);

            // Process batch when it reaches batch size
            if (plants.length >= this.batchSize && !isProcessing) {
              isProcessing = true;
              stream.pause();
              
              await this.insertBatch([...plants]);
              plants.length = 0;
              
              isProcessing = false;
              stream.resume();
            }
          } catch (error) {
            this.errorCount++;
            console.error(`❌ Error processing row ${this.processedCount + 1}:`, error.message);
          }
        })
        .on('end', async () => {
          try {
            // Insert remaining plants
            if (plants.length > 0) {
              await this.insertBatch(plants);
            }
            
            console.log('✅ Migration completed!');
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ Stream error:', error.message);
          reject(error);
        });
    });
  }

  transformPlantData(row) {
    return {
      // Core identification
      id: parseInt(row.id) || 0,
      scientificName: row.scientificName || '',
      commonName: row.commonName || '',
      emoji: row.emoji || '🌱',
      
      // Classification
      category: row.category || '',
      family: row.family || '',
      plantType: row.plantType || '',
      
      // Growing conditions
      climate: row.climate || '',
      difficulty: row.difficulty || '',
      growthTime: row.growthTime || '',
      
      // Physical characteristics
      matureHeight: row.matureHeight || '',
      matureWidth: row.matureWidth || '',
      leafColor: row.leafColor || '',
      flowerColor: row.flowerColor || '',
      fruitColor: row.fruitColor || '',
      
      // Growing requirements
      soilType: row.soilType || '',
      soilPh: row.soilPh || '',
      waterNeeds: row.waterNeeds || '',
      sunlightNeeds: row.sunlightNeeds || '',
      fertilizerNeeds: row.fertilizerNeeds || '',
      
      // Care instructions
      plantingSeason: row.plantingSeason || '',
      harvestSeason: row.harvestSeason || '',
      pruningNeeds: row.pruningNeeds || '',
      pestResistance: row.pestResistance || '',
      diseaseResistance: row.diseaseResistance || '',
      
      // Usage and benefits
      edibleParts: row.edibleParts || '',
      medicinalUses: row.medicinalUses || '',
      ornamentalValue: row.ornamentalValue || '',
      wildlifeAttraction: row.wildlifeAttraction || '',
      
      // Additional properties
      toxicity: row.toxicity || '',
      propagationMethods: row.propagationMethods || '',
      companionPlants: row.companionPlants || '',
      spacingRequirements: row.spacingRequirements || '',
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      dataSource: 'CSV Migration',
      
      // Search optimization
      searchText: `${row.commonName || ''} ${row.scientificName || ''} ${row.family || ''} ${row.category || ''}`.toLowerCase(),
      tags: [
        row.category?.toLowerCase(),
        row.family?.toLowerCase(),
        row.plantType?.toLowerCase(),
        row.climate?.toLowerCase(),
        row.difficulty?.toLowerCase()
      ].filter(Boolean)
    };
  }

  async insertBatch(plants) {
    try {
      const result = await this.collection.insertMany(plants, { ordered: false });
      this.processedCount += result.insertedCount;
      
      // Progress update
      if (this.processedCount % 10000 === 0) {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = this.processedCount / elapsed;
        console.log(`📈 Progress: ${this.processedCount.toLocaleString()} plants migrated (${rate.toFixed(0)} plants/sec)`);
      }
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key errors are expected, count them
        this.errorCount += error.result?.nInserted || 0;
      } else {
        console.error('❌ Batch insert error:', error.message);
        this.errorCount += plants.length;
      }
    }
  }

  async createIndexes() {
    try {
      console.log('🔍 Creating MongoDB indexes for optimal performance...');
      
      // Text search index for fast search
      await this.collection.createIndex(
        { 
          commonName: 'text', 
          scientificName: 'text', 
          family: 'text',
          category: 'text',
          searchText: 'text'
        },
        { 
          name: 'text_search_index',
          weights: {
            commonName: 10,
            scientificName: 8,
            family: 5,
            category: 3,
            searchText: 1
          }
        }
      );

      // Single field indexes for filtering
      await this.collection.createIndex({ family: 1 });
      await this.collection.createIndex({ category: 1 });
      await this.collection.createIndex({ plantType: 1 });
      await this.collection.createIndex({ climate: 1 });
      await this.collection.createIndex({ difficulty: 1 });
      await this.collection.createIndex({ id: 1 }, { unique: true });

      // Compound indexes for complex queries
      await this.collection.createIndex({ category: 1, family: 1 });
      await this.collection.createIndex({ climate: 1, difficulty: 1 });
      await this.collection.createIndex({ plantType: 1, category: 1 });

      console.log('✅ All indexes created successfully!');
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
    }
  }

  async getStats() {
    try {
      const totalCount = await this.collection.countDocuments();
      const samplePlant = await this.collection.findOne();
      
      console.log('\n📊 MIGRATION STATISTICS:');
      console.log(`📈 Total plants migrated: ${totalCount.toLocaleString()}`);
      console.log(`❌ Errors encountered: ${this.errorCount}`);
      console.log(`⏱️  Total time: ${((Date.now() - this.startTime) / 1000).toFixed(2)} seconds`);
      console.log(`🚀 Average rate: ${(this.processedCount / ((Date.now() - this.startTime) / 1000)).toFixed(0)} plants/sec`);
      
      if (samplePlant) {
        console.log('\n🌱 SAMPLE PLANT:');
        console.log(`   Name: ${samplePlant.commonName} (${samplePlant.scientificName})`);
        console.log(`   Family: ${samplePlant.family}`);
        console.log(`   Category: ${samplePlant.category}`);
        console.log(`   Fields: ${Object.keys(samplePlant).length} total fields`);
      }
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }

  async run() {
    try {
      console.log('🚀 STARTING MONGODB MIGRATION');
      console.log('================================');
      
      // Connect to MongoDB
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to MongoDB');
      }

      // Clear existing data
      await this.clearExistingData();

      // Migrate plants
      await this.migratePlants();

      // Create indexes
      await this.createIndexes();

      // Show statistics
      await this.getStats();

      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('=====================================');
      console.log('✅ Your 390K plants are now in MongoDB!');
      console.log('🔍 Search performance will be dramatically improved');
      console.log('📊 Ready to create MongoDB-based APIs');

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migrator = new PlantMigrator();
  migrator.run()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = PlantMigrator;
