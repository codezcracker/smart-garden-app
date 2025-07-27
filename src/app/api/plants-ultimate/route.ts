import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface Plant {
  id: string;
  name: string;
  emoji: string;
  category: string;
  family: string;
  climate: string;
  difficulty: string;
  growthTime: string;
}

// Cache for plant data to avoid reading CSV on every request
let plantCache: Plant[] | null = null;
let statsCache: Record<string, unknown> | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load plants into cache
async function loadPlantCache() {
  const now = Date.now();
  if (plantCache && (now - lastCacheTime) < CACHE_DURATION) {
    return plantCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'plant-database.csv');
    
    if (!fs.existsSync(csvPath)) {
      // Fallback to sample database
      const samplePath = path.join(process.cwd(), 'data', 'plant-database-sample.csv');
      if (!fs.existsSync(samplePath)) {
        throw new Error('No plant database found');
      }
      
      return new Promise<Plant[]>((resolve) => {
        const plants: Plant[] = [];
        fs.createReadStream(samplePath)
          .pipe(csv())
          .on('data', (row) => plants.push(row))
          .on('end', () => {
            plantCache = plants;
            lastCacheTime = now;
            resolve(plants);
          });
      });
    }

    return new Promise<Plant[]>((resolve) => {
      const plants: Plant[] = [];
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => plants.push(row))
        .on('end', () => {
          plantCache = plants;
          lastCacheTime = now;
          resolve(plants);
        });
    });
  } catch (error) {
    console.error('Error loading plant cache:', error);
    return [];
  }
}

// Calculate stats from cached data
async function calculateStats() {
  const now = Date.now();
  if (statsCache && (now - lastCacheTime) < CACHE_DURATION) {
    return statsCache;
  }

  const plants = await loadPlantCache();
  
  const stats = {
    totalPlants: plants.length,
    families: new Set<string>(),
    climates: new Set<string>(),
    categories: new Set<string>(),
    difficulties: new Set<string>()
  };

  plants.forEach(plant => {
    stats.families.add(plant.family);
    stats.climates.add(plant.climate);
    stats.categories.add(plant.category);
    stats.difficulties.add(plant.difficulty);
  });

  const result = {
    totalPlants: stats.totalPlants,
    uniqueFamilies: stats.families.size,
    uniqueClimates: stats.climates.size,
    uniqueCategories: stats.categories.size,
    uniqueDifficulties: stats.difficulties.size,
    families: Array.from(stats.families).sort(),
    climates: Array.from(stats.climates).sort(),
    categories: Array.from(stats.categories).sort(),
    difficulties: Array.from(stats.difficulties).sort()
  };

  statsCache = result;
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const climate = searchParams.get('climate') || '';
    const category = searchParams.get('category') || '';
    const action = searchParams.get('action') || 'list';

    // Check if we want to get statistics instead of plants
    if (action === 'stats') {
      const stats = await calculateStats();
      return NextResponse.json(stats);
    }

    // Get cached plants
    const allPlants = await loadPlantCache();
    
    // Apply filters
    const filteredPlants = allPlants.filter(plant => {
      if (search && !plant.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (family && plant.family !== family) {
        return false;
      }
      if (climate && plant.climate !== climate) {
        return false;
      }
      if (category && plant.category !== category) {
        return false;
      }
      return true;
    });

    // Calculate pagination
    const totalPlants = filteredPlants.length;
    const totalPages = Math.ceil(totalPlants / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPlants = filteredPlants.slice(startIndex, endIndex);

    // Get unique values for filters (limited to avoid memory issues)
    const families = [...new Set(allPlants.slice(0, 1000).map(p => p.family))].sort().slice(0, 100);
    const climates = [...new Set(allPlants.slice(0, 1000).map(p => p.climate))].sort();
    const categories = [...new Set(allPlants.slice(0, 1000).map(p => p.category))].sort();

    return NextResponse.json({
      plants: paginatedPlants,
      pagination: {
        page,
        limit,
        totalPlants,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        families,
        climates,
        categories
      },
      database: 'full',
      cacheInfo: {
        cached: !!plantCache,
        lastUpdated: new Date(lastCacheTime).toISOString()
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 