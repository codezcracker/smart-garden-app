const fs = require('fs');
const path = require('path');

console.log('🌱 Smart Garden Database Conversion Test');
console.log('=====================================\n');

// Check if CSV file exists
const csvPath = path.join(__dirname, 'data', 'plant-database.csv');
const samplePath = path.join(__dirname, 'data', 'plant-database-sample.csv');

if (fs.existsSync(csvPath)) {
  console.log('✅ Found your full CSV file:', csvPath);
  console.log('📊 File size:', (fs.statSync(csvPath).size / 1024 / 1024).toFixed(2), 'MB');
  
  // Count lines
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').length - 1; // Subtract header
  console.log('🌿 Total plants:', lines.toLocaleString());
  
  console.log('\n🚀 To convert to JSON chunks, run:');
  console.log('   yarn convert-csv');
  
} else if (fs.existsSync(samplePath)) {
  console.log('📋 Found sample CSV file:', samplePath);
  console.log('💡 This is a small sample for testing');
  console.log('\n📝 To use your full 1.6M+ plant database:');
  console.log('   1. Copy your full CSV file to data/plant-database.csv');
  console.log('   2. Run: yarn convert-csv');
  console.log('   3. The app will automatically use the optimized JSON chunks');
  
} else {
  console.log('❌ No CSV file found');
  console.log('\n📝 To set up your database:');
  console.log('   1. Place your CSV file in data/plant-database.csv');
  console.log('   2. Run: yarn convert-csv');
  console.log('   3. Your app will be optimized for 1.6M+ plants');
}

console.log('\n📚 For detailed instructions, see: DATABASE_SETUP.md');
console.log('🌐 Your live app: https://smart-garden-g2mkgb37k-codezs-projects.vercel.app'); 