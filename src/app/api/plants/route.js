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
  'pepper': ['Capsicum', 'annuum', 'pepper', 'peppers'],
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
  'beans': ['Phaseolus', 'vulgaris', 'bean', 'beans'],
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
  'biennial': ['biennial']
};

// Cache for plant data with search index
let plantCache = null;
let searchIndex = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Create search index for faster lookups
function createSearchIndex(plants) {
  const index = new Map();
  
  plants.forEach((plant, idx) => {
    // Include common name in searchable text if available
    const searchableText = plant.commonName 
      ? `${plant.name} ${plant.commonName} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase()
      : `${plant.name} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase();
    
    const words = searchableText.split(/\s+/);
    
    words.forEach(word => {
      if (word.length >= 2) { // Only index words with 2+ characters
        if (!index.has(word)) {
          index.set(word, new Set());
        }
        index.get(word).add(idx);
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
    // Try to use the database with common names first
    const csvPath = path.join(process.cwd(), 'data', 'plant-database-common-names.csv');
    const fallbackPath = path.join(process.cwd(), 'data', 'plant-database.csv');
    
    const filePath = fs.existsSync(csvPath) ? csvPath : fallbackPath;
    
    return new Promise((resolve) => {
      const plants = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Handle both databases (with and without common names)
          if (row.name && row.emoji && row.category && row.family && row.climate && row.difficulty && row.growthTime) {
            const plant = {
              id: row.id || Math.random().toString(36).substr(2, 9),
              name: row.name.trim(),
              commonName: row.commonName || null, // Will be null for the original database
              emoji: row.emoji.trim(),
              category: row.category.trim(),
              family: row.family.trim(),
              climate: row.climate.trim(),
              difficulty: row.difficulty.trim(),
              growthTime: row.growthTime.trim()
            };
            plants.push(plant);
          }
        })
        .on('end', () => {
          plantCache = plants;
          searchIndex = createSearchIndex(plants);
          lastCacheTime = now;
          console.log(`Loaded ${plants.length} plants from database and created search index`);
          console.log(`Database includes common names: ${plants.some(p => p.commonName) ? 'Yes' : 'No'}`);
          resolve({ plants, searchIndex });
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          resolve({ plants: [], searchIndex: new Map() });
        });
    });
  } catch (error) {
    console.error('Error loading plants:', error);
    return { plants: [], searchIndex: new Map() };
  }
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
  
  return [...new Set(expandedTerms)]; // Remove duplicates
}

// Fast search using index
function fastSearch(plants, searchIndex, searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    return plants;
  }
  
  const searchLower = searchTerm.toLowerCase();
  const words = searchLower.split(/\s+/);
  const expandedTerms = expandSearchTerms(searchTerm);
  
  // Get matching indices for each word
  const matchingIndices = new Set();
  
  // First, try exact matches in the index
  words.forEach(word => {
    if (searchIndex.has(word)) {
      searchIndex.get(word).forEach(idx => matchingIndices.add(idx));
    }
  });
  
  // Also check expanded terms
  expandedTerms.forEach(term => {
    if (searchIndex.has(term)) {
      searchIndex.get(term).forEach(idx => matchingIndices.add(idx));
    }
  });
  
  // If no results from index, fall back to full text search
  if (matchingIndices.size === 0) {
    return plants.filter(plant => {
      const searchableText = plant.commonName 
        ? `${plant.name} ${plant.commonName} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase()
        : `${plant.name} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase();
      
      return expandedTerms.some(term => searchableText.includes(term)) ||
             words.some(word => searchableText.includes(word));
    });
  }
  
  // Convert back to plants
  return Array.from(matchingIndices).map(idx => plants[idx]).filter(Boolean);
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

    // Get all plants and search index
    const { plants: allPlants, searchIndex } = await loadPlants();
    
    // Apply filters with optimized search
    let filteredPlants = allPlants;
    
    // Use fast search if search term is provided
    if (search) {
      filteredPlants = fastSearch(allPlants, searchIndex, search);
    }
    
    // Apply additional filters
    if (family || climate || category) {
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
      searchInfo: {
        searchTerm: search,
        resultsFound: totalPlants,
        totalInDatabase: allPlants.length,
        expandedTerms: search ? expandSearchTerms(search) : []
      },
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