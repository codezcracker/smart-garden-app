import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple in-memory cache for better performance
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 1000; // Increased limit for better UX
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const category = searchParams.get('category') || '';
    
    // Check cache first
    const cacheKey = `${page}-${limit}-${search}-${family}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Read the converted CSV file
    const csvPath = path.join(process.cwd(), 'data', 'plant-database-sample.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV and convert to JSON - OPTIMIZED
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    let allPlants = [];
    let plants = [];
    
    // If we have filters, we need to process more data to find matches
    const hasFilters = (family && family !== 'all') || (category && category !== 'all') || search;
    
    // Process ALL lines from the CSV (no artificial limits)
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] && lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const plant = {};
        
        headers.forEach((header, index) => {
          plant[header] = values[index] || '';
        });
        
        if (plant.name && plant.name.trim() !== '') {
          allPlants.push(plant);
        }
      }
    }
    
    // Apply filters to allPlants
    plants = allPlants;
    
    // Apply search filter - OPTIMIZED
    if (search) {
      const searchLower = search.toLowerCase();
      plants = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) ||
        plant.family.toLowerCase().includes(searchLower) ||
        plant.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply family filter - OPTIMIZED
    if (family && family !== 'all') {
      plants = plants.filter(plant => plant.family === family);
    }
    
    // Apply category filter - OPTIMIZED
    if (category && category !== 'all') {
      plants = plants.filter(plant => plant.category === category);
    }
    
    // Get filtered total count for accurate pagination
    const filteredTotal = plants.length;
    
    // Always apply pagination after filtering
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const totalResults = plants.length;
    const totalPages = Math.ceil(totalResults / limit);
    
    // Get the current page of results
    plants = plants.slice(startIndex, endIndex);
    
    // Get total count - use filtered count if filters are applied, otherwise use full count
    const totalPlants = (family && family !== 'all') || (category && category !== 'all') || search 
      ? filteredTotal 
      : lines.length - 1; // Subtract header line
    
    // No need for additional pagination since we already paginated at the CSV level
    const paginatedPlants = plants;
    
    // Get family counts from the full dataset
    const familyCounts = {};
    const categoryCounts = {};
    
    // Get accurate counts from the full processed dataset
    allPlants.forEach(plant => {
      const family = plant.family || 'Unknown';
      const category = plant.category || 'Unknown';
      
      familyCounts[family] = (familyCounts[family] || 0) + 1;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Create families with counts
    const majorFamilies = [
      'Asteraceae', 'Fabaceae', 'Orchidaceae', 'Poaceae', 'Rubiaceae', 
      'Lamiaceae', 'Euphorbiaceae', 'Apocynaceae', 'Malvaceae', 'Acanthaceae',
      'Solanaceae', 'Rosaceae', 'Brassicaceae', 'Cucurbitaceae', 'Apiaceae',
      'Rutaceae', 'Myrtaceae', 'Proteaceae', 'Ericaceae', 'Fagaceae', 'Pinaceae'
    ];
    
    const families = [
      { name: 'all', count: totalPlants },
      ...majorFamilies.map(family => ({
        name: family,
        count: familyCounts[family] || 0
      }))
    ];
    
    // Create categories with counts
    const categories = [
      { name: 'all', count: totalPlants },
      { name: 'Species', count: categoryCounts['Species'] || 0 },
      { name: 'Genus', count: categoryCounts['Genus'] || 0 },
      { name: 'Family', count: categoryCounts['Family'] || 0 },
      { name: 'Order', count: categoryCounts['Order'] || 0 },
      { name: 'Class', count: categoryCounts['Class'] || 0 },
      { name: 'Phylum', count: categoryCounts['Phylum'] || 0 }
    ];
    
    const responseData = {
      success: true,
      plants: paginatedPlants,
      total: totalPlants,
      page,
      limit,
      totalPages: Math.ceil(totalPlants / limit),
      families,
      categories,
      source: 'Converted CSV (1.6M plants)'
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error reading converted CSV:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read converted CSV data',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 