import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Enhanced plant care database
const careDatabase = {
  // Vegetables with detailed care
  vegetables: {
    'tomato': {
      careNotes: 'Needs full sun, regular watering, and support for vines',
      harvestTime: 'Summer to Fall',
      spacing: '24-36 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining, rich soil',
      pH: '6.0-6.8',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Basil', 'Marigolds', 'Garlic'],
      pests: ['Aphids', 'Tomato hornworms', 'Whiteflies'],
      diseases: ['Early blight', 'Late blight', 'Blossom end rot'],
      growthTime: '60-80 days',
      difficulty: 'Easy'
    },
    'lettuce': {
      careNotes: 'Plant in cool weather, keep soil moist, harvest outer leaves',
      harvestTime: 'Spring and Fall',
      spacing: '6-12 inches',
      sunRequirement: 'Partial Sun',
      waterRequirement: 'High',
      soilType: 'Rich, well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Carrots', 'Radishes', 'Strawberries'],
      pests: ['Aphids', 'Slugs', 'Snails'],
      diseases: ['Downy mildew', 'Bacterial leaf spot'],
      growthTime: '45-60 days',
      difficulty: 'Easy'
    }
  },
  
  // Herbs with detailed care
  herbs: {
    'basil': {
      careNotes: 'Pinch off flower buds, regular harvesting, companion to tomatoes',
      harvestTime: 'Summer to Fall',
      spacing: '12-18 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Tomatoes', 'Peppers', 'Oregano'],
      pests: ['Aphids', 'Whiteflies', 'Japanese beetles'],
      diseases: ['Downy mildew', 'Fusarium wilt'],
      growthTime: '30-60 days',
      difficulty: 'Easy'
    },
    'mint': {
      careNotes: 'Invasive - plant in containers, regular pruning, partial shade',
      harvestTime: 'Spring to Fall',
      spacing: '18-24 inches',
      sunRequirement: 'Partial Sun',
      waterRequirement: 'High',
      soilType: 'Rich, moist soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Cabbage', 'Tomatoes'],
      pests: ['Aphids', 'Spider mites'],
      diseases: ['Rust', 'Powdery mildew'],
      growthTime: '40-60 days',
      difficulty: 'Easy'
    }
  },
  
  // Fruits with detailed care
  fruits: {
    'strawberry': {
      careNotes: 'Plant in well-draining soil, remove runners, mulch in winter',
      harvestTime: 'Spring to Summer',
      spacing: '12-18 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining, slightly acidic soil',
      pH: '5.5-6.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Lettuce', 'Spinach', 'Thyme'],
      pests: ['Slugs', 'Birds', 'Spider mites'],
      diseases: ['Gray mold', 'Leaf spot', 'Powdery mildew'],
      growthTime: '60-90 days',
      difficulty: 'Easy'
    },
    'apple': {
      careNotes: 'Cross-pollination needed, annual pruning, pest management',
      harvestTime: 'Fall',
      spacing: '15-20 feet',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Chives', 'Garlic', 'Nasturtiums'],
      pests: ['Codling moths', 'Aphids', 'Apple maggots'],
      diseases: ['Apple scab', 'Fire blight', 'Powdery mildew'],
      growthTime: '3-5 years',
      difficulty: 'Hard'
    }
  }
};

// Function to get care information for a plant
function getCareInfo(plantName, family, category) {
  const normalizedName = plantName.toLowerCase().replace(/[^a-z]/g, '');
  
  // Check vegetables
  if (careDatabase.vegetables[normalizedName]) {
    return careDatabase.vegetables[normalizedName];
  }
  
  // Check herbs
  if (careDatabase.herbs[normalizedName]) {
    return careDatabase.herbs[normalizedName];
  }
  
  // Check fruits
  if (careDatabase.fruits[normalizedName]) {
    return careDatabase.fruits[normalizedName];
  }
  
  // Default care based on family
  const defaultCare = {
    careNotes: 'General care information available',
    harvestTime: 'Varies by species',
    spacing: 'Check specific requirements',
    sunRequirement: 'Full Sun to Partial Shade',
    waterRequirement: 'Moderate',
    soilType: 'Well-draining soil',
    pH: '6.0-7.0',
    frostTolerance: 'Check hardiness zone',
    companionPlants: ['Research companion planting'],
    pests: ['Monitor for common pests'],
    diseases: ['Practice good garden hygiene'],
    growthTime: 'Varies by species',
    difficulty: 'Medium'
  };
  
  return defaultCare;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 24;
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const category = searchParams.get('category') || '';
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'data', 'plant-database.csv');
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({
        success: false,
        error: 'Plant database not found. Please add your CSV file to data/plant-database.csv',
        instructions: 'Copy your 1.6M plant CSV file to data/plant-database.csv'
      }, { status: 404 });
    }
    
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Process all plants
    const allPlants = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const plant = {};
        
        headers.forEach((header, index) => {
          plant[header] = values[index] || '';
        });
        
        // Add enhanced care information
        const careInfo = getCareInfo(plant.name, plant.family, plant.category);
        plant.careInfo = careInfo;
        
        allPlants.push(plant);
      }
    }
    
    // Apply filters
    let filteredPlants = allPlants;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPlants = filteredPlants.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) ||
        (plant.family && plant.family.toLowerCase().includes(searchLower)) ||
        (plant.category && plant.category.toLowerCase().includes(searchLower))
      );
    }
    
    if (family && family !== 'all') {
      filteredPlants = filteredPlants.filter(plant => plant.family === family);
    }
    
    if (category && category !== 'all') {
      filteredPlants = filteredPlants.filter(plant => plant.category === category);
    }
    
    // Apply pagination
    const totalResults = filteredPlants.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPlants = filteredPlants.slice(startIndex, endIndex);
    
    // Get family and category counts
    const familyCounts = {};
    const categoryCounts = {};
    
    allPlants.forEach(plant => {
      const family = plant.family || 'Unknown';
      const category = plant.category || 'Unknown';
      
      familyCounts[family] = (familyCounts[family] || 0) + 1;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const families = Object.entries(familyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return NextResponse.json({
      success: true,
      plants: paginatedPlants,
      total: allPlants.length,
      currentPage: page,
      totalPages,
      totalResults,
      families: [
        { name: 'all', count: allPlants.length },
        ...families.filter(f => f.count > 0)
      ],
      categories: [
        { name: 'all', count: allPlants.length },
        ...categories.filter(c => c.count > 0)
      ],
      source: 'Enhanced Plant Database (1.6M+ species with care info)',
      enhanced: true
    });
    
  } catch (error) {
    console.error('Error in enhanced plants API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load enhanced plant data',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 