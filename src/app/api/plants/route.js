import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Common name mappings for better search
const commonNameMappings = {
  // Vegetables
  'carrot': ['Daucus', 'carota', 'carrot', 'carrots'],
  'tomato': ['Solanum', 'lycopersicum', 'Lycopersicon', 'tomato', 'tomatoes'],
  'potato': ['Solanum', 'tuberosum', 'potato', 'potatoes'],
  'onion': ['Allium', 'cepa', 'onion', 'onions'],
  'garlic': ['Allium', 'sativum', 'garlic'],
  'lettuce': ['Lactuca', 'sativa', 'lettuce'],
  'spinach': ['Spinacia', 'oleracea', 'spinach'],
  'cabbage': ['Brassica', 'oleracea', 'cabbage'],
  'broccoli': ['Brassica', 'oleracea', 'broccoli'],
  'cauliflower': ['Brassica', 'oleracea', 'cauliflower'],
  'pepper': ['Capsicum', 'annuum', 'pepper', 'peppers', 'bell pepper', 'chili'],
  'cucumber': ['Cucumis', 'sativus', 'cucumber', 'cucumbers'],
  'pumpkin': ['Cucurbita', 'pepo', 'pumpkin', 'pumpkins'],
  'squash': ['Cucurbita', 'squash'],
  'zucchini': ['Cucurbita', 'pepo', 'zucchini'],
  'eggplant': ['Solanum', 'melongena', 'eggplant', 'aubergine'],
  'radish': ['Raphanus', 'sativus', 'radish', 'radishes'],
  'beet': ['Beta', 'vulgaris', 'beet', 'beets'],
  'turnip': ['Brassica', 'rapa', 'turnip', 'turnips'],
  'parsnip': ['Pastinaca', 'sativa', 'parsnip', 'parsnips'],
  'celery': ['Apium', 'graveolens', 'celery'],
  'asparagus': ['Asparagus', 'officinalis', 'asparagus'],
  'artichoke': ['Cynara', 'scolymus', 'artichoke', 'artichokes'],
  'okra': ['Abelmoschus', 'esculentus', 'okra'],
  'corn': ['Zea', 'mays', 'corn', 'maize'],
  'peas': ['Pisum', 'sativum', 'pea', 'peas'],
  'beans': ['Phaseolus', 'vulgaris', 'bean', 'beans', 'green beans'],
  'lentils': ['Lens', 'culinaris', 'lentil', 'lentils'],
  'chickpeas': ['Cicer', 'arietinum', 'chickpea', 'chickpeas', 'garbanzo'],
  
  // Fruits
  'apple': ['Malus', 'domestica', 'apple', 'apples'],
  'banana': ['Musa', 'banana', 'bananas'],
  'orange': ['Citrus', 'sinensis', 'orange', 'oranges'],
  'lemon': ['Citrus', 'limon', 'lemon', 'lemons'],
  'lime': ['Citrus', 'aurantifolia', 'lime', 'limes'],
  'grape': ['Vitis', 'vinifera', 'grape', 'grapes'],
  'strawberry': ['Fragaria', 'strawberry', 'strawberries'],
  'raspberry': ['Rubus', 'raspberry', 'raspberries'],
  'blueberry': ['Vaccinium', 'blueberry', 'blueberries'],
  'blackberry': ['Rubus', 'blackberry', 'blackberries'],
  'cherry': ['Prunus', 'cherry', 'cherries'],
  'peach': ['Prunus', 'persica', 'peach', 'peaches'],
  'plum': ['Prunus', 'plum', 'plums'],
  'apricot': ['Prunus', 'armeniaca', 'apricot', 'apricots'],
  'pear': ['Pyrus', 'pear', 'pears'],
  'fig': ['Ficus', 'carica', 'fig', 'figs'],
  'pineapple': ['Ananas', 'comosus', 'pineapple', 'pineapples'],
  'mango': ['Mangifera', 'indica', 'mango', 'mangoes'],
  'avocado': ['Persea', 'americana', 'avocado', 'avocados'],
  'kiwi': ['Actinidia', 'kiwi', 'kiwis'],
  'pomegranate': ['Punica', 'granatum', 'pomegranate', 'pomegranates'],
  'watermelon': ['Citrullus', 'lanatus', 'watermelon', 'watermelons'],
  'cantaloupe': ['Cucumis', 'melo', 'cantaloupe', 'cantaloupes'],
  'honeydew': ['Cucumis', 'melo', 'honeydew', 'honeydews'],
  
  // Herbs
  'basil': ['Ocimum', 'basilicum', 'basil'],
  'mint': ['Mentha', 'mint'],
  'rosemary': ['Rosmarinus', 'officinalis', 'rosemary'],
  'thyme': ['Thymus', 'thyme'],
  'sage': ['Salvia', 'officinalis', 'sage'],
  'oregano': ['Origanum', 'vulgare', 'oregano'],
  'parsley': ['Petroselinum', 'crispum', 'parsley'],
  'cilantro': ['Coriandrum', 'sativum', 'cilantro', 'coriander'],
  'dill': ['Anethum', 'graveolens', 'dill'],
  'chives': ['Allium', 'schoenoprasum', 'chives'],
  'bay': ['Laurus', 'nobilis', 'bay', 'bay leaf'],
  'lavender': ['Lavandula', 'lavender'],
  'chamomile': ['Matricaria', 'chamomilla', 'chamomile'],
  'lemon balm': ['Melissa', 'officinalis', 'lemon balm'],
  
  // Nuts
  'almond': ['Prunus', 'dulcis', 'almond', 'almonds'],
  'walnut': ['Juglans', 'walnut', 'walnuts'],
  'pecan': ['Carya', 'illinoinensis', 'pecan', 'pecans'],
  'hazelnut': ['Corylus', 'hazelnut', 'hazelnuts'],
  'pistachio': ['Pistacia', 'vera', 'pistachio', 'pistachios'],
  'cashew': ['Anacardium', 'occidentale', 'cashew', 'cashews'],
  'macadamia': ['Macadamia', 'macadamia', 'macadamias'],
  'pine nut': ['Pinus', 'pine nut', 'pine nuts'],
  
  // Spices
  'cinnamon': ['Cinnamomum', 'cinnamon'],
  'nutmeg': ['Myristica', 'fragrans', 'nutmeg'],
  'cloves': ['Syzygium', 'aromaticum', 'clove', 'cloves'],
  'ginger': ['Zingiber', 'officinale', 'ginger'],
  'turmeric': ['Curcuma', 'longa', 'turmeric'],
  'cardamom': ['Elettaria', 'cardamomum', 'cardamom'],
  'saffron': ['Crocus', 'sativus', 'saffron'],
  'vanilla': ['Vanilla', 'vanilla'],
  
  // Common terms
  'berry': ['berry', 'berries', 'fruit'],
  'herb': ['herb', 'herbs', 'spice', 'spices'],
  'vegetable': ['vegetable', 'vegetables', 'crop', 'crops'],
  'fruit': ['fruit', 'fruits'],
  'tree': ['tree', 'trees'],
  'shrub': ['shrub', 'shrubs'],
  'flower': ['flower', 'flowers'],
  'grass': ['grass', 'grasses'],
  'vine': ['vine', 'vines'],
  'cactus': ['cactus', 'cacti'],
  'succulent': ['succulent', 'succulents'],
  'annual': ['annual'],
  'perennial': ['perennial'],
  'biennial': ['biennial'],
  
  // Additional common names and variations
  'bell pepper': ['Capsicum', 'annuum', 'bell pepper', 'bell peppers'],
  'chili': ['Capsicum', 'annuum', 'chili', 'chilies', 'chile', 'chiles'],
  'green beans': ['Phaseolus', 'vulgaris', 'green beans', 'string beans'],
  'string beans': ['Phaseolus', 'vulgaris', 'green beans', 'string beans'],
  'garbanzo': ['Cicer', 'arietinum', 'chickpea', 'chickpeas', 'garbanzo'],
  'bay leaf': ['Laurus', 'nobilis', 'bay', 'bay leaf'],
  'coriander': ['Coriandrum', 'sativum', 'cilantro', 'coriander'],
  'maize': ['Zea', 'mays', 'corn', 'maize'],
  'aubergine': ['Solanum', 'melongena', 'eggplant', 'aubergine']
};

// Cache for plant data with search index
let plantCache = null;
let searchIndex = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Enhanced search index creation with better tokenization
function createSearchIndex(plants) {
  const index = new Map();
  
  plants.forEach((plant, idx) => {
    // Create comprehensive searchable text including common names
    const searchableText = plant.commonName 
      ? `${plant.name} ${plant.commonName} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase()
      : `${plant.name} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase();
    
    // Better tokenization - split on spaces and special characters
    const words = searchableText.split(/[\s\-_.,;:()]+/).filter(word => word.length > 0);
    
    words.forEach(word => {
      if (word.length >= 2) { // Only index words with 2+ characters
        if (!index.has(word)) {
          index.set(word, new Set());
        }
        index.get(word).add(idx);
      }
      
      // Also index partial matches for better search
      if (word.length >= 3) {
        for (let i = 3; i <= word.length; i++) {
          const partial = word.substring(0, i);
          if (!index.has(partial)) {
            index.set(partial, new Set());
          }
          index.get(partial).add(idx);
        }
      }
    });
  });
  
  return index;
}

async function loadPlants() {
  const now = Date.now();
  if (plantCache && searchIndex && (now - lastCacheTime) < CACHE_DURATION) {
    return { plants: plantCache, searchIndex };
  }

  try {
    // First try to load the common names database
    const commonNamesPath = path.join(process.cwd(), 'data', 'plant-database-common-names.csv');
    const fullDatabasePath = path.join(process.cwd(), 'data', 'plant-database.csv');
    
    let plants = [];
    
    // Try to load common names database first
    if (fs.existsSync(commonNamesPath)) {
      console.log('Loading common names database...');
      plants = await loadFromCSV(commonNamesPath, true);
    }
    
    // If common names database is small, also load some from the full database
    if (plants.length < 100 && fs.existsSync(fullDatabasePath)) {
      console.log('Loading additional plants from full database...');
      const additionalPlants = await loadFromCSV(fullDatabasePath, false, 1000); // Load first 1000
      plants = [...plants, ...additionalPlants];
    }
    
    // If still no plants, use the sample database
    if (plants.length === 0) {
      const samplePath = path.join(process.cwd(), 'data', 'plant-database-sample.csv');
      if (fs.existsSync(samplePath)) {
        console.log('Loading sample database...');
        plants = await loadFromCSV(samplePath, false);
      }
    }
    
    plantCache = plants;
    searchIndex = createSearchIndex(plants);
    lastCacheTime = now;
    console.log(`Loaded ${plants.length} plants and created search index`);
    console.log(`Plants with common names: ${plants.filter(p => p.commonName).length}`);
    
    return { plants, searchIndex };
  } catch (error) {
    console.error('Error loading plants:', error);
    return { plants: [], searchIndex: new Map() };
  }
}

async function loadFromCSV(filePath, hasCommonNames = false, limit = null) {
  return new Promise((resolve) => {
    const plants = [];
    let count = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (limit && count >= limit) return;
        
        if (row.name && row.emoji && row.category && row.family && row.climate && row.difficulty && row.growthTime) {
          const plant = {
            id: row.id || Math.random().toString(36).substr(2, 9),
            name: row.name.trim(),
            commonName: hasCommonNames ? (row.commonName || null) : null,
            emoji: row.emoji.trim(),
            category: row.category.trim(),
            family: row.family.trim(),
            climate: row.climate.trim(),
            difficulty: row.difficulty.trim(),
            growthTime: row.growthTime.trim()
          };
          plants.push(plant);
          count++;
        }
      })
      .on('end', () => {
        resolve(plants);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        resolve([]);
      });
  });
}

function expandSearchTerms(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const expandedTerms = [searchLower];
  
  // Check if the search term matches any common names
  for (const [commonName, scientificTerms] of Object.entries(commonNameMappings)) {
    if (commonName.includes(searchLower) || searchLower.includes(commonName)) {
      expandedTerms.push(...scientificTerms);
    }
  }
  
  // Add partial matches for better search
  if (searchLower.length >= 3) {
    for (let i = 3; i <= searchLower.length; i++) {
      expandedTerms.push(searchLower.substring(0, i));
    }
  }
  
  return [...new Set(expandedTerms)]; // Remove duplicates
}

// Enhanced search function with relevance scoring
function enhancedSearch(plants, searchIndex, searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    return plants;
  }
  
  const searchLower = searchTerm.toLowerCase();
  const words = searchLower.split(/\s+/);
  const expandedTerms = expandSearchTerms(searchTerm);
  
  // Get matching indices for each word with relevance scoring
  const matchScores = new Map();
  
  // First, try exact matches in the index
  words.forEach(word => {
    if (searchIndex.has(word)) {
      searchIndex.get(word).forEach(idx => {
        const currentScore = matchScores.get(idx) || 0;
        matchScores.set(idx, currentScore + 10); // Exact word match gets high score
      });
    }
  });
  
  // Also check expanded terms
  expandedTerms.forEach(term => {
    if (searchIndex.has(term)) {
      searchIndex.get(term).forEach(idx => {
        const currentScore = matchScores.get(idx) || 0;
        matchScores.set(idx, currentScore + 5); // Expanded term match gets medium score
      });
    }
  });
  
  // If no results from index, fall back to full text search
  if (matchScores.size === 0) {
    const fallbackResults = plants.filter(plant => {
      const searchableText = plant.commonName 
        ? `${plant.name} ${plant.commonName} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase()
        : `${plant.name} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase();
      
      // Check for partial matches
      return expandedTerms.some(term => searchableText.includes(term)) ||
             words.some(word => searchableText.includes(word)) ||
             searchableText.includes(searchLower);
    });
    
    // Score fallback results
    return fallbackResults.map(plant => {
      const searchableText = plant.commonName 
        ? `${plant.name} ${plant.commonName} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase()
        : `${plant.name} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase();
      
      let score = 0;
      if (plant.name.toLowerCase().includes(searchLower)) score += 20;
      if (plant.commonName && plant.commonName.toLowerCase().includes(searchLower)) score += 15;
      if (plant.family.toLowerCase().includes(searchLower)) score += 8;
      if (plant.category.toLowerCase().includes(searchLower)) score += 6;
      if (plant.climate.toLowerCase().includes(searchLower)) score += 4;
      
      return { plant, score };
    }).sort((a, b) => b.score - a.score).map(item => item.plant);
  }
  
  // Convert back to plants with scoring
  const scoredResults = Array.from(matchScores.entries()).map(([idx, score]) => ({
    plant: plants[idx],
    score
  })).filter(item => item.plant).sort((a, b) => b.score - a.score);
  
  return scoredResults.map(item => item.plant);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const climate = searchParams.get('climate') || '';
    const category = searchParams.get('category') || '';

    console.log(`API Request - Search: "${search}", Family: "${family}", Climate: "${climate}", Category: "${category}", Page: ${page}`);

    // Get all plants and search index
    const { plants: allPlants, searchIndex } = await loadPlants();
    
    if (!allPlants || allPlants.length === 0) {
      console.error('No plants loaded from database');
      return NextResponse.json({ 
        error: 'No plants available in database',
        plants: [],
        pagination: { page: 1, limit, totalPlants: 0, totalPages: 0, hasNext: false, hasPrev: false },
        filters: { families: [], climates: [], categories: [] }
      }, { status: 404 });
    }
    
    // Apply filters with enhanced search
    let filteredPlants = allPlants;
    
    // Use enhanced search if search term is provided
    if (search && search.trim().length > 0) {
      console.log(`Performing search for: "${search}"`);
      filteredPlants = enhancedSearch(allPlants, searchIndex, search);
      console.log(`Search returned ${filteredPlants.length} results`);
    }
    
    // Apply additional filters
    if (family || climate || category) {
      const initialCount = filteredPlants.length;
      filteredPlants = filteredPlants.filter(plant => {
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
      console.log(`Filters applied: ${initialCount} -> ${filteredPlants.length} results`);
    }

    // Calculate pagination
    const totalPlants = filteredPlants.length;
    const totalPages = Math.ceil(totalPlants / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPlants = filteredPlants.slice(startIndex, endIndex);

    // Get unique values for filters (limit to first 1000 for performance)
    const samplePlants = allPlants.slice(0, 1000);
    const families = [...new Set(samplePlants.map(p => p.family))].sort();
    const climates = [...new Set(samplePlants.map(p => p.climate))].sort();
    const categories = [...new Set(samplePlants.map(p => p.category))].sort();

    const response = {
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
      database: 'enhanced',
      searchInfo: {
        searchTerm: search,
        resultsFound: totalPlants,
        totalInDatabase: allPlants.length,
        expandedTerms: search ? expandSearchTerms(search) : [],
        hasCommonNames: allPlants.some(p => p.commonName)
      },
      cacheInfo: {
        cached: !!plantCache,
        lastUpdated: new Date(lastCacheTime).toISOString()
      }
    };

    console.log(`API Response - Returning ${paginatedPlants.length} plants (${totalPlants} total, page ${page}/${totalPages})`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
      plants: [],
      pagination: { page: 1, limit: 20, totalPlants: 0, totalPages: 0, hasNext: false, hasPrev: false },
      filters: { families: [], climates: [], categories: [] }
    }, { status: 500 });
  }
} 