import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { searchGBIFPlant, getGBIFStats } from '../../../lib/gbif-api.js';
import { searchTreflePlant, getTrefleStats } from '../../../lib/trefle-api.js';

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 24;
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const category = searchParams.get('category') || '';
    const enhanced = searchParams.get('enhanced') === 'true';
    
    // Check cache first
    const cacheKey = `ultimate-${page}-${limit}-${search}-${family}-${category}-${enhanced}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Read your CSV database
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
    
    // Process all plants from your CSV
    const allPlants = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const plant = {};
        
        headers.forEach((header, index) => {
          plant[header] = values[index] || '';
        });
        
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
    
    // Enhance plants with external APIs if requested
    let enhancedPlants = paginatedPlants;
    
    if (enhanced && search) {
      // Enhance the first few plants with external data
      const plantsToEnhance = paginatedPlants.slice(0, 5); // Limit to 5 for performance
      
      enhancedPlants = await Promise.all(
        plantsToEnhance.map(async (plant) => {
          try {
            // Get GBIF data (2.2M+ species)
            const gbifData = await searchGBIFPlant(plant.name);
            
            // Get Trefle data (1.4M+ species)
            const trefleData = await searchTreflePlant(plant.name);
            
            return {
              ...plant,
              // GBIF data (taxonomy and distribution)
              gbif: gbifData.success ? gbifData.data : null,
              gbifSource: gbifData.source,
              
              // Trefle data (care information and images)
              trefle: trefleData.success ? trefleData.data : null,
              trefleSource: trefleData.source,
              
              // Combined care information
              careInfo: {
                // Priority: Trefle > GBIF > Default
                careNotes: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.careNotes 
                  : 'Care information available from external sources',
                lightRequirement: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.lightRequirement 
                  : 'Check specific requirements',
                waterRequirement: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.waterRequirement 
                  : 'Moderate',
                soilRequirement: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.soilRequirement 
                  : 'Well-draining soil',
                hardinessZone: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.hardinessZone 
                  : 'Check local hardiness zone',
                growthHabit: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.growthHabit 
                  : 'Varies by species',
                maxHeight: trefleData.success && trefleData.data.careInfo 
                  ? trefleData.data.careInfo.maxHeight 
                  : 'Varies by species'
              },
              
              // Images
              images: trefleData.success && trefleData.data.imageUrl 
                ? [trefleData.data.imageUrl] 
                : [],
              
              // Distribution data
              distribution: gbifData.success ? {
                occurrenceCount: gbifData.data.occurrenceCount,
                countries: gbifData.data.occurrences.map(o => o.country).filter(Boolean)
              } : null
            };
          } catch (error) {
            console.error(`Error enhancing plant ${plant.name}:`, error);
            return plant;
          }
        })
      );
      
      // Add remaining plants without enhancement
      if (paginatedPlants.length > 5) {
        enhancedPlants = [
          ...enhancedPlants,
          ...paginatedPlants.slice(5)
        ];
      }
    }
    
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
    
    // Get database statistics
    const gbifStats = await getGBIFStats();
    const trefleStats = await getTrefleStats();
    
    const responseData = {
      success: true,
      plants: enhancedPlants,
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
      source: 'Ultimate Plant Database (1.6M + GBIF 2.2M + Trefle 1.4M)',
      enhanced: enhanced,
      databaseStats: {
        yourDatabase: {
          totalSpecies: allPlants.length,
          source: 'Your CSV Database'
        },
        gbif: gbifStats.success ? gbifStats.data : { error: 'GBIF stats unavailable' },
        trefle: trefleStats.success ? trefleStats.data : { error: 'Trefle stats unavailable' }
      },
      coverage: {
        totalCoverage: 'Maximum possible coverage',
        sources: [
          'Your CSV (1.6M+ species)',
          'GBIF (2.2M+ species)',
          'Trefle (1.4M+ species)'
        ]
      }
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error in ultimate plants API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load ultimate plant data',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 