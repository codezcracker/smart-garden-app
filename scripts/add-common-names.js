const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Common name mappings for popular plants
const commonNameMappings = {
  // Vegetables
  'Daucus carota': 'Carrot',
  'Solanum lycopersicum': 'Tomato',
  'Solanum tuberosum': 'Potato',
  'Allium cepa': 'Onion',
  'Allium sativum': 'Garlic',
  'Lactuca sativa': 'Lettuce',
  'Spinacia oleracea': 'Spinach',
  'Brassica oleracea': 'Cabbage',
  'Capsicum annuum': 'Bell Pepper',
  'Cucumis sativus': 'Cucumber',
  'Cucurbita pepo': 'Pumpkin',
  'Solanum melongena': 'Eggplant',
  'Raphanus sativus': 'Radish',
  'Beta vulgaris': 'Beet',
  'Brassica rapa': 'Turnip',
  'Pastinaca sativa': 'Parsnip',
  'Apium graveolens': 'Celery',
  'Asparagus officinalis': 'Asparagus',
  'Cynara scolymus': 'Artichoke',
  'Abelmoschus esculentus': 'Okra',
  'Zea mays': 'Corn',
  'Pisum sativum': 'Peas',
  'Phaseolus vulgaris': 'Beans',
  'Lens culinaris': 'Lentils',
  'Cicer arietinum': 'Chickpeas',
  
  // Fruits
  'Malus domestica': 'Apple',
  'Musa acuminata': 'Banana',
  'Citrus sinensis': 'Orange',
  'Citrus limon': 'Lemon',
  'Citrus aurantifolia': 'Lime',
  'Vitis vinifera': 'Grape',
  'Fragaria ananassa': 'Strawberry',
  'Rubus idaeus': 'Raspberry',
  'Vaccinium corymbosum': 'Blueberry',
  'Rubus fruticosus': 'Blackberry',
  'Prunus avium': 'Cherry',
  'Prunus persica': 'Peach',
  'Prunus domestica': 'Plum',
  'Prunus armeniaca': 'Apricot',
  'Pyrus communis': 'Pear',
  'Ficus carica': 'Fig',
  'Ananas comosus': 'Pineapple',
  'Mangifera indica': 'Mango',
  'Persea americana': 'Avocado',
  'Actinidia deliciosa': 'Kiwi',
  'Punica granatum': 'Pomegranate',
  'Citrullus lanatus': 'Watermelon',
  'Cucumis melo': 'Cantaloupe',
  
  // Herbs
  'Ocimum basilicum': 'Basil',
  'Mentha spicata': 'Mint',
  'Rosmarinus officinalis': 'Rosemary',
  'Thymus vulgaris': 'Thyme',
  'Salvia officinalis': 'Sage',
  'Origanum vulgare': 'Oregano',
  'Petroselinum crispum': 'Parsley',
  'Coriandrum sativum': 'Cilantro',
  'Anethum graveolens': 'Dill',
  'Allium schoenoprasum': 'Chives',
  'Laurus nobilis': 'Bay Leaf',
  'Lavandula angustifolia': 'Lavender',
  'Matricaria chamomilla': 'Chamomile',
  'Melissa officinalis': 'Lemon Balm',
  
  // Nuts
  'Prunus dulcis': 'Almond',
  'Juglans regia': 'Walnut',
  'Carya illinoinensis': 'Pecan',
  'Corylus avellana': 'Hazelnut',
  'Pistacia vera': 'Pistachio',
  'Anacardium occidentale': 'Cashew',
  'Macadamia integrifolia': 'Macadamia',
  'Pinus pinea': 'Pine Nut',
  
  // Spices
  'Cinnamomum verum': 'Cinnamon',
  'Myristica fragrans': 'Nutmeg',
  'Syzygium aromaticum': 'Cloves',
  'Zingiber officinale': 'Ginger',
  'Curcuma longa': 'Turmeric',
  'Elettaria cardamomum': 'Cardamom',
  'Crocus sativus': 'Saffron',
  'Vanilla planifolia': 'Vanilla'
};

// Create a mapping file for common names
function createCommonNameMapping() {
  const mapping = {};
  
  // Read the plant database and create mappings
  const plants = [];
  
  return new Promise((resolve) => {
    fs.createReadStream(path.join(process.cwd(), 'data', 'plant-database.csv'))
      .pipe(csv())
      .on('data', (row) => {
        if (row.name) {
          const scientificName = row.name.trim();
          
          // Check if this scientific name has a common name mapping
          if (commonNameMappings[scientificName]) {
            mapping[scientificName] = commonNameMappings[scientificName];
          }
          
          // Also check for partial matches (genus level)
          const genus = scientificName.split(' ')[0];
          for (const [sciName, commonName] of Object.entries(commonNameMappings)) {
            if (sciName.startsWith(genus + ' ')) {
              mapping[scientificName] = commonName;
              break;
            }
          }
        }
      })
      .on('end', () => {
        // Write the mapping to a file
        const mappingPath = path.join(process.cwd(), 'data', 'common-names-mapping.json');
        fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
        console.log(`Created common name mapping with ${Object.keys(mapping).length} entries`);
        console.log('Mapping saved to:', mappingPath);
        resolve(mapping);
      });
  });
}

// Create a sample database with common names
function createSampleWithCommonNames() {
  const samplePlants = [
    {
      id: 'carrot-1',
      name: 'Daucus carota',
      commonName: 'Carrot',
      emoji: '🥕',
      category: 'Vegetable',
      family: 'Apiaceae',
      climate: 'Temperate',
      difficulty: 'Easy',
      growthTime: '1 year'
    },
    {
      id: 'tomato-1',
      name: 'Solanum lycopersicum',
      commonName: 'Tomato',
      emoji: '🍅',
      category: 'Vegetable',
      family: 'Solanaceae',
      climate: 'Temperate',
      difficulty: 'Medium',
      growthTime: '1 year'
    },
    {
      id: 'basil-1',
      name: 'Ocimum basilicum',
      commonName: 'Basil',
      emoji: '🌿',
      category: 'Herb',
      family: 'Lamiaceae',
      climate: 'Tropical',
      difficulty: 'Easy',
      growthTime: '1 year'
    },
    {
      id: 'apple-1',
      name: 'Malus domestica',
      commonName: 'Apple',
      emoji: '🍎',
      category: 'Fruit',
      family: 'Rosaceae',
      climate: 'Temperate',
      difficulty: 'Medium',
      growthTime: '5 years'
    },
    {
      id: 'strawberry-1',
      name: 'Fragaria ananassa',
      commonName: 'Strawberry',
      emoji: '🍓',
      category: 'Fruit',
      family: 'Rosaceae',
      climate: 'Temperate',
      difficulty: 'Easy',
      growthTime: '1 year'
    }
  ];
  
  const csvContent = [
    'id,name,commonName,emoji,category,family,climate,difficulty,growthTime',
    ...samplePlants.map(plant => 
      `${plant.id},"${plant.name}","${plant.commonName}",${plant.emoji},"${plant.category}","${plant.family}","${plant.climate}","${plant.difficulty}","${plant.growthTime}"`
    )
  ].join('\n');
  
  const samplePath = path.join(process.cwd(), 'data', 'plant-database-common-names.csv');
  fs.writeFileSync(samplePath, csvContent);
  console.log('Created sample database with common names:', samplePath);
  return samplePath;
}

// Main execution
async function main() {
  console.log('Creating common name mapping...');
  await createCommonNameMapping();
  
  console.log('Creating sample database with common names...');
  createSampleWithCommonNames();
  
  console.log('Done!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createCommonNameMapping, createSampleWithCommonNames }; 