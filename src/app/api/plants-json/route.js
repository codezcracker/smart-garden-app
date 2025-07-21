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
    const limit = parseInt(searchParams.get('limit')) || 24;
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const category = searchParams.get('category') || '';
    
    // Check cache first
    const cacheKey = `json-${page}-${limit}-${search}-${family}-${category}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Path to JSON chunks
    const chunksDir = path.join(process.cwd(), 'data', 'json-chunks');
    const metadataPath = path.join(chunksDir, 'metadata.json');
    const indexesPath = path.join(chunksDir, 'indexes.json');
    
    // Check if JSON chunks exist
    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json({
        success: false,
        error: 'JSON chunks not found. Please run the conversion script first.',
        instructions: 'Run: node scripts/convert-csv-to-json.js'
      }, { status: 404 });
    }
    
    // Read metadata and indexes
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const indexes = JSON.parse(fs.readFileSync(indexesPath, 'utf-8'));
    
    let allPlants = [];
    
    // If no filters, load specific chunks for pagination
    const hasFilters = (family && family !== 'all') || (category && category !== 'all') || search;
    
    if (!hasFilters) {
      // Load only the chunks needed for current page
      const startChunk = Math.floor((page - 1) * limit / 1000) + 1;
      const endChunk = Math.ceil(page * limit / 1000);
      
      for (let i = startChunk; i <= Math.min(endChunk, metadata.totalChunks); i++) {
        const chunkPath = path.join(chunksDir, `chunk-${String(i).padStart(4, '0')}.json`);
        if (fs.existsSync(chunkPath)) {
          const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
          allPlants.push(...chunkData.plants);
        }
      }
    } else {
      // Load all chunks for filtering
      for (let i = 1; i <= metadata.totalChunks; i++) {
        const chunkPath = path.join(chunksDir, `chunk-${String(i).padStart(4, '0')}.json`);
        if (fs.existsSync(chunkPath)) {
          const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
          allPlants.push(...chunkData.plants);
        }
      }
    }
    
    // Apply filters
    let plants = allPlants;
    
    if (search) {
      const searchLower = search.toLowerCase();
      plants = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) ||
        plant.family.toLowerCase().includes(searchLower) ||
        plant.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (family && family !== 'all') {
      plants = plants.filter(plant => plant.family === family);
    }
    
    if (category && category !== 'all') {
      plants = plants.filter(plant => plant.category === category);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const totalResults = plants.length;
    const totalPages = Math.ceil(totalResults / limit);
    
    plants = plants.slice(startIndex, endIndex);
    
    // Prepare response
    const responseData = {
      success: true,
      plants,
      total: hasFilters ? totalResults : metadata.totalPlants,
      currentPage: page,
      totalPages,
      totalResults,
      families: [
        { name: 'all', count: metadata.totalPlants },
        ...indexes.families.filter(f => f.count > 0)
      ],
      categories: [
        { name: 'all', count: metadata.totalPlants },
        ...indexes.categories.filter(c => c.count > 0)
      ],
      source: 'JSON Chunks (Optimized)',
      metadata: {
        totalPlants: metadata.totalPlants,
        totalChunks: metadata.totalChunks,
        chunkSize: metadata.chunkSize
      }
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error reading JSON chunks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read JSON chunks',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 