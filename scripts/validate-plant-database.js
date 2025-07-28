const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Data validation script for the 2.5M plant database
async function validatePlantDatabase() {
  const csvPath = path.join(__dirname, '../data/plant-database.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Plant database file not found:', csvPath);
    return;
  }

  console.log('🔍 Validating plant database...');
  
  const stats = {
    totalPlants: 0,
    families: {},
    genera: {},
    commonNameMatches: 0,
    dataIssues: [],
    samplePlants: []
  };

  // Common name mappings for validation
  const commonNameMappings = {
    'tomato': ['Solanum', 'lycopersicum', 'Lycopersicon'],
    'carrot': ['Daucus', 'carota'],
    'potato': ['Solanum', 'tuberosum'],
    'pepper': ['Capsicum', 'bell pepper', 'chili'],
    'onion': ['Allium', 'cepa'],
    'garlic': ['Allium', 'sativum'],
    'lettuce': ['Lactuca', 'sativa'],
    'cucumber': ['Cucumis', 'sativus'],
    'corn': ['Zea', 'mays'],
    'wheat': ['Triticum', 'aestivum'],
    'rice': ['Oryza', 'sativa'],
    'apple': ['Malus', 'domestica'],
    'banana': ['Musa', 'acuminata'],
    'orange': ['Citrus', 'sinensis'],
    'grape': ['Vitis', 'vinifera']
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        stats.totalPlants++;
        
        // Count families
        const family = row.family || 'Unknown';
        stats.families[family] = (stats.families[family] || 0) + 1;
        
        // Extract genus from plant name
        const genus = row.name.split(' ')[0];
        stats.genera[genus] = (stats.genera[genus] || 0) + 1;
        
        // Check for common name matches
        const plantName = row.name.toLowerCase();
        const plantFamily = row.family.toLowerCase();
        
        for (const [commonName, scientificTerms] of Object.entries(commonNameMappings)) {
          for (const term of scientificTerms) {
            if (plantName.includes(term.toLowerCase()) || plantFamily.includes(term.toLowerCase())) {
              stats.commonNameMatches++;
              stats.samplePlants.push({
                commonName,
                plantName: row.name,
                family: row.family,
                term
              });
              break;
            }
          }
        }
        
        // Collect sample plants for analysis
        if (stats.samplePlants.length < 20) {
          stats.samplePlants.push({
            commonName: 'sample',
            plantName: row.name,
            family: row.family,
            term: 'sample'
          });
        }
        
        // Log progress
        if (stats.totalPlants % 100000 === 0) {
          console.log(`📊 Processed ${stats.totalPlants.toLocaleString()} plants...`);
        }
      })
      .on('end', () => {
        console.log('\n✅ Database validation complete!');
        console.log(`\n📈 Summary:`);
        console.log(`   Total plants: ${stats.totalPlants.toLocaleString()}`);
        console.log(`   Unique families: ${Object.keys(stats.families).length}`);
        console.log(`   Unique genera: ${Object.keys(stats.genera).length}`);
        console.log(`   Common name matches: ${stats.commonNameMatches}`);
        
        console.log(`\n🌿 Top 10 Families:`);
        Object.entries(stats.families)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .forEach(([family, count]) => {
            console.log(`   ${family}: ${count.toLocaleString()} plants`);
          });
        
        console.log(`\n🌱 Top 10 Genera:`);
        Object.entries(stats.genera)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .forEach(([genus, count]) => {
            console.log(`   ${genus}: ${count.toLocaleString()} plants`);
          });
        
        console.log(`\n🔍 Sample Plants with Common Name Matches:`);
        stats.samplePlants
          .filter(p => p.commonName !== 'sample')
          .slice(0, 10)
          .forEach((plant, i) => {
            console.log(`   ${i + 1}. ${plant.commonName} → ${plant.plantName} (${plant.family})`);
          });
        
        console.log(`\n📋 Sample Plants from Database:`);
        stats.samplePlants
          .filter(p => p.commonName === 'sample')
          .slice(0, 10)
          .forEach((plant, i) => {
            console.log(`   ${i + 1}. ${plant.plantName} (${plant.family})`);
          });
        
        resolve(stats);
      })
      .on('error', reject);
  });
}

// Run validation if called directly
if (require.main === module) {
  validatePlantDatabase()
    .then(() => {
      console.log('\n🎉 Validation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validatePlantDatabase }; 