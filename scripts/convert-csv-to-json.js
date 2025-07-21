const fs = require('fs');
const path = require('path');

// Configuration
const CHUNK_SIZE = 1000; // Number of plants per JSON file
const INPUT_CSV = path.join(__dirname, '../data/plant-database.csv');
const OUTPUT_DIR = path.join(__dirname, '../data/json-chunks');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function convertCSVToJSONChunks() {
  try {
    console.log('🔄 Converting CSV to JSON chunks...');
    
    // Read the CSV file
    const csvContent = fs.readFileSync(INPUT_CSV, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Headers:', headers);
    
    // Process data lines
    const plants = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] && lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const plant = {};
        
        headers.forEach((header, index) => {
          plant[header] = values[index] || '';
        });
        
        if (plant.name && plant.name.trim() !== '') {
          plants.push(plant);
        }
      }
    }
    
    console.log(`🌱 Total plants found: ${plants.length.toLocaleString()}`);
    
    // Split into chunks
    const chunks = [];
    for (let i = 0; i < plants.length; i += CHUNK_SIZE) {
      chunks.push(plants.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`📦 Creating ${chunks.length} JSON chunks...`);
    
    // Create metadata file
    const metadata = {
      totalPlants: plants.length,
      totalChunks: chunks.length,
      chunkSize: CHUNK_SIZE,
      headers: headers,
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Create chunk files
    chunks.forEach((chunk, index) => {
      const chunkData = {
        chunkIndex: index + 1,
        totalChunks: chunks.length,
        plants: chunk,
        count: chunk.length
      };
      
      const filename = `chunk-${String(index + 1).padStart(4, '0')}.json`;
      fs.writeFileSync(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify(chunkData, null, 2)
      );
    });
    
    // Create family and category indexes
    const familyCounts = {};
    const categoryCounts = {};
    
    plants.forEach(plant => {
      const family = plant.family || 'Unknown';
      const category = plant.category || 'Unknown';
      
      familyCounts[family] = (familyCounts[family] || 0) + 1;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const indexes = {
      families: Object.entries(familyCounts).map(([name, count]) => ({ name, count })),
      categories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
      totalPlants: plants.length
    };
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'indexes.json'),
      JSON.stringify(indexes, null, 2)
    );
    
    console.log('✅ Conversion complete!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log(`📊 Total chunks: ${chunks.length}`);
    console.log(`🌿 Total plants: ${plants.length.toLocaleString()}`);
    console.log(`📋 Families: ${Object.keys(familyCounts).length}`);
    console.log(`🏷️ Categories: ${Object.keys(categoryCounts).length}`);
    
  } catch (error) {
    console.error('❌ Error converting CSV:', error.message);
  }
}

// Run the conversion
convertCSVToJSONChunks(); 