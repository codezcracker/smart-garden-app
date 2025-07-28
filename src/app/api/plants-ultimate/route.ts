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

interface SearchResult extends Plant {
  _matchScore: number;
  _matchReason: string;
}

interface PlantStats {
  totalPlants: number;
  families: { [key: string]: number };
  climates: { [key: string]: number };
  categories: { [key: string]: number };
  difficulties: { [key: string]: number };
  growthTimes: { [key: string]: number };
}

// Common name mappings for better search
const commonNameMappings: { [key: string]: string[] } = {
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

// Cache for plant data to avoid reading CSV on every request
let plantCache: Plant[] | null = null;
let searchIndex: Map<string, Set<number>> | null = null;
let statsCache: PlantStats | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Enhanced search index creation for large datasets
function createSearchIndex(plants: Plant[]): Map<string, Set<number>> {
  const index = new Map<string, Set<number>>();
  
  console.log('Creating search index for', plants.length, 'plants...');
  
  plants.forEach((plant, idx) => {
    // Create searchable text
    const searchableText = `${plant.name} ${plant.family} ${plant.category} ${plant.climate}`.toLowerCase();
    
    // Better tokenization - split on spaces and special characters
    const words = searchableText.split(/[\s\-_.,;:()]+/).filter(word => word.length > 0);
    
    words.forEach(word => {
      // Only index words with 3+ characters to avoid too many false positives
      if (word.length >= 3) {
        if (!index.has(word)) {
          index.set(word, new Set());
        }
        index.get(word)!.add(idx);
      }
      
      // Index partial matches only for longer words (4+ characters) and limit to 4-char prefixes
      if (word.length >= 4 && word.length <= 10) {
        for (let i = 4; i <= Math.min(word.length, 6); i++) {
          const partial = word.substring(0, i);
          if (!index.has(partial)) {
            index.set(partial, new Set());
          }
          index.get(partial)!.add(idx);
        }
      }
    });
  });
  
  console.log('Search index created with', index.size, 'unique terms');
  return index;
}

// Expand search terms using common name mappings
function expandSearchTerms(searchTerm: string): string[] {
  const searchLower = searchTerm.toLowerCase();
  const expandedTerms = [searchLower];
  
  // Check if the search term matches any common names
  for (const [commonName, scientificTerms] of Object.entries(commonNameMappings)) {
    if (commonName.includes(searchLower) || searchLower.includes(commonName)) {
      expandedTerms.push(...scientificTerms);
    }
  }
  
  // Add partial matches for better search (but be more conservative)
  if (searchLower.length >= 4) {
    for (let i = 4; i <= Math.min(searchLower.length, 6); i++) {
      expandedTerms.push(searchLower.substring(0, i));
    }
  }
  
  return [...new Set(expandedTerms)]; // Remove duplicates
}

// Load plants into cache with better memory management
async function loadPlantCache(): Promise<Plant[]> {
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
          .on('data', (row) => {
            if (row.name && row.emoji && row.category && row.family && row.climate && row.difficulty && row.growthTime) {
              plants.push({
                id: row.id || Math.random().toString(36).substr(2, 9),
                name: row.name.trim(),
                emoji: row.emoji.trim(),
                category: row.category.trim(),
                family: row.family.trim(),
                climate: row.climate.trim(),
                difficulty: row.difficulty.trim(),
                growthTime: row.growthTime.trim()
              });
            }
          })
          .on('end', () => {
            plantCache = plants;
            lastCacheTime = now;
            console.log(`Loaded ${plants.length} plants from sample database`);
            resolve(plants);
          });
      });
    }

    return new Promise<Plant[]>((resolve) => {
      const plants: Plant[] = [];
      let processedCount = 0;
      
      console.log('Loading full plant database...');
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.emoji && row.category && row.family && row.climate && row.difficulty && row.growthTime) {
            plants.push({
              id: row.id || Math.random().toString(36).substr(2, 9),
              name: row.name.trim(),
              emoji: row.emoji.trim(),
              category: row.category.trim(),
              family: row.family.trim(),
              climate: row.climate.trim(),
              difficulty: row.difficulty.trim(),
              growthTime: row.growthTime.trim()
            });
          }
          
          processedCount++;
          if (processedCount % 100000 === 0) {
            console.log(`Processed ${processedCount.toLocaleString()} plants...`);
          }
        })
        .on('end', () => {
          plantCache = plants;
          lastCacheTime = now;
          console.log(`Successfully loaded ${plants.length.toLocaleString()} plants from full database`);
          resolve(plants);
        })
        .on('error', (error) => {
          console.error('Error loading plant database:', error);
          resolve([]);
        });
    });
  } catch (error) {
    console.error('Error loading plant cache:', error);
    return [];
  }
}

// Enhanced search function for large datasets with common name support
function enhancedSearch(plants: Plant[], searchIndex: Map<string, Set<number>>, searchTerm: string): Plant[] {
  if (!searchTerm || searchTerm.length < 2) {
    return plants;
  }
  
  const searchLower = searchTerm.toLowerCase();
  const words = searchLower.split(/\s+/);
  const expandedTerms = expandSearchTerms(searchTerm);
  
  console.log(`Searching for: "${searchTerm}" with expanded terms:`, expandedTerms);
  
  // Improved search approach that works with the current database structure
  const results: SearchResult[] = [];
  let matchCount = 0;
  
  // Search through all plants (increased limit for better coverage)
  const searchLimit = Math.min(1000000, plants.length);
  
  for (let i = 0; i < searchLimit; i++) {
    const plant = plants[i];
    const plantName = plant.name.toLowerCase();
    const plantFamily = plant.family.toLowerCase();
    
    let isMatch = false;
    let matchReason = '';
    let matchScore = 0;
    
    // Check each expanded term
    for (const term of expandedTerms) {
      const termLower = term.toLowerCase();
      
      // Check if plant name starts with the term (genus match) - HIGHEST PRIORITY
      if (plantName.startsWith(termLower + ' ')) {
        isMatch = true;
        matchReason = `genus match: ${plant.name} starts with ${term}`;
        matchScore = 100;
        break;
      }
      
      // Check if any word in plant name exactly matches the term
      const plantWords = plantName.split(' ');
      if (plantWords.some(word => word === termLower)) {
        isMatch = true;
        matchReason = `exact word match: ${plant.name} contains ${term}`;
        matchScore = 80;
        break;
      }
      
      // Check if plant name contains the term as a substring
      if (plantName.includes(termLower)) {
        isMatch = true;
        matchReason = `substring match: ${plant.name} contains ${term}`;
        matchScore = 60;
        break;
      }
    }
    
    // Also check if the original search term appears in the plant name
    if (!isMatch && plantName.includes(searchLower)) {
      isMatch = true;
      matchReason = `original term match: ${plant.name} contains ${searchTerm}`;
      matchScore = 40;
    }
    
    // Check family as a last resort (but with lower priority due to data inconsistencies)
    if (!isMatch && plantFamily.includes(searchLower)) {
      isMatch = true;
      matchReason = `family match: ${plant.name} in family ${plant.family}`;
      matchScore = 20;
    }
    
    // Additional check: if searching for common names, also check if any expanded term appears in family
    if (!isMatch) {
      for (const term of expandedTerms) {
        const termLower = term.toLowerCase();
        if (plantFamily.includes(termLower)) {
          isMatch = true;
          matchReason = `expanded term in family: ${plant.name} in family ${plant.family} contains ${term}`;
          matchScore = 15;
          break;
        }
      }
    }
    
    if (isMatch) {
      results.push({ ...plant, _matchScore: matchScore, _matchReason: matchReason });
      matchCount++;
      
      if (matchCount <= 5) {
        console.log(`Match ${matchCount}: ${matchReason} (score: ${matchScore})`);
      }
    }
  }
  
  console.log(`Found ${results.length} results for "${searchTerm}" in first ${searchLimit} plants`);
  
  // Sort by match score (highest first) and then by plant name, then return only Plant objects
  return results
    .sort((a, b) => {
      if (b._matchScore !== a._matchScore) {
        return b._matchScore - a._matchScore;
      }
      return a.name.localeCompare(b.name);
    })
    .map(({ _matchScore, _matchReason, ...plant }) => plant);
}

// Calculate statistics for the full dataset
async function calculateStats(): Promise<PlantStats> {
  const now = Date.now();
  if (statsCache && (now - lastCacheTime) < CACHE_DURATION) {
    return statsCache;
  }

  const plants = await loadPlantCache();
  
  const stats: PlantStats = {
    totalPlants: plants.length,
    families: {},
    climates: {},
    categories: {},
    difficulties: {},
    growthTimes: {}
  };

  plants.forEach(plant => {
    stats.families[plant.family] = (stats.families[plant.family] || 0) + 1;
    stats.climates[plant.climate] = (stats.climates[plant.climate] || 0) + 1;
    stats.categories[plant.category] = (stats.categories[plant.category] || 0) + 1;
    stats.difficulties[plant.difficulty] = (stats.difficulties[plant.difficulty] || 0) + 1;
    stats.growthTimes[plant.growthTime] = (stats.growthTimes[plant.growthTime] || 0) + 1;
  });

  statsCache = stats;
  return stats;
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

    console.log(`Ultimate API Request - Action: ${action}, Search: "${search}", Page: ${page}, Limit: ${limit}`);

    // Check if we want to get statistics instead of plants
    if (action === 'stats') {
      const stats = await calculateStats();
      return NextResponse.json(stats);
    }

    // Get cached plants and search index
    const allPlants = await loadPlantCache();
    
    // Create search index if not exists
    if (!searchIndex) {
      searchIndex = createSearchIndex(allPlants);
    }
    
    // Apply filters
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

    // Get unique values for filters (limited to avoid memory issues)
    const families = [...new Set(allPlants.slice(0, 10000).map(p => p.family))].sort().slice(0, 100);
    const climates = [...new Set(allPlants.slice(0, 10000).map(p => p.climate))].sort();
    const categories = [...new Set(allPlants.slice(0, 10000).map(p => p.category))].sort();

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
      database: 'full-2.5M',
      searchInfo: {
        searchTerm: search,
        resultsFound: totalPlants,
        totalInDatabase: allPlants.length,
        hasSearchIndex: !!searchIndex,
        expandedTerms: search ? expandSearchTerms(search) : []
      },
      cacheInfo: {
        cached: !!plantCache,
        lastUpdated: new Date(lastCacheTime).toISOString()
      }
    };

    console.log(`Ultimate API Response - Returning ${paginatedPlants.length} plants (${totalPlants.toLocaleString()} total, page ${page}/${totalPages})`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ultimate API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      plants: [],
      pagination: { page: 1, limit: 100, totalPlants: 0, totalPages: 0, hasNext: false, hasPrev: false },
      filters: { families: [], climates: [], categories: [] }
    }, { status: 500 });
  }
} 