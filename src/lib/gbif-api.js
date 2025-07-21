// GBIF API Integration
// Global Biodiversity Information Facility - 2.2M+ species

const GBIF_BASE_URL = 'https://api.gbif.org/v1';

/**
 * Search for a plant species in GBIF database
 * @param {string} plantName - Common or scientific name
 * @returns {Promise<Object>} Plant data from GBIF
 */
export async function searchGBIFPlant(plantName) {
  try {
    // First, try to match the species name
    const matchResponse = await fetch(`${GBIF_BASE_URL}/species/match?name=${encodeURIComponent(plantName)}`);
    
    if (!matchResponse.ok) {
      throw new Error(`GBIF match failed: ${matchResponse.status}`);
    }
    
    const matchData = await matchResponse.json();
    
    if (matchData.matchType === 'NONE') {
      // Try search endpoint as fallback
      return await searchGBIFSpecies(plantName);
    }
    
    // Get detailed information about the matched species
    const speciesKey = matchData.usageKey;
    const speciesResponse = await fetch(`${GBIF_BASE_URL}/species/${speciesKey}`);
    
    if (!speciesResponse.ok) {
      throw new Error(`GBIF species fetch failed: ${speciesResponse.status}`);
    }
    
    const speciesData = await speciesResponse.json();
    
    // Get occurrence data (distribution)
    const occurrenceResponse = await fetch(`${GBIF_BASE_URL}/occurrence/search?speciesKey=${speciesKey}&limit=10`);
    const occurrenceData = await occurrenceResponse.json();
    
    return {
      success: true,
      data: {
        // Basic taxonomy
        scientificName: speciesData.scientificName,
        commonNames: speciesData.vernacularNames || [],
        family: speciesData.family,
        genus: speciesData.genus,
        species: speciesData.species,
        kingdom: speciesData.kingdom,
        phylum: speciesData.phylum,
        class: speciesData.class,
        order: speciesData.order,
        
        // Additional info
        taxonomicStatus: speciesData.taxonomicStatus,
        nomenclaturalStatus: speciesData.nomenclaturalStatus,
        year: speciesData.year,
        authors: speciesData.authors,
        
        // Distribution
        occurrenceCount: occurrenceData.count,
        occurrences: occurrenceData.results || [],
        
        // GBIF metadata
        gbifKey: speciesKey,
        matchType: matchData.matchType,
        confidence: matchData.confidence
      },
      source: 'GBIF (2.2M+ species)'
    };
    
  } catch (error) {
    console.error('GBIF API Error:', error);
    return {
      success: false,
      error: error.message,
      source: 'GBIF'
    };
  }
}

/**
 * Search for species using GBIF search endpoint
 * @param {string} plantName - Plant name to search
 * @returns {Promise<Object>} Search results
 */
async function searchGBIFSpecies(plantName) {
  try {
    const response = await fetch(`${GBIF_BASE_URL}/species/search?q=${encodeURIComponent(plantName)}&limit=5`);
    
    if (!response.ok) {
      throw new Error(`GBIF search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results.length === 0) {
      return {
        success: false,
        error: 'No species found',
        source: 'GBIF'
      };
    }
    
    // Return the best match
    const bestMatch = data.results[0];
    
    return {
      success: true,
      data: {
        scientificName: bestMatch.scientificName,
        commonNames: bestMatch.vernacularNames || [],
        family: bestMatch.family,
        genus: bestMatch.genus,
        species: bestMatch.species,
        kingdom: bestMatch.kingdom,
        phylum: bestMatch.phylum,
        class: bestMatch.class,
        order: bestMatch.order,
        gbifKey: bestMatch.key,
        matchType: 'SEARCH',
        confidence: 'MEDIUM'
      },
      source: 'GBIF (2.2M+ species)'
    };
    
  } catch (error) {
    console.error('GBIF Search Error:', error);
    return {
      success: false,
      error: error.message,
      source: 'GBIF'
    };
  }
}

/**
 * Get occurrence data for a species
 * @param {string} speciesKey - GBIF species key
 * @returns {Promise<Object>} Occurrence data
 */
export async function getGBIFOccurrences(speciesKey) {
  try {
    const response = await fetch(`${GBIF_BASE_URL}/occurrence/search?speciesKey=${speciesKey}&limit=100`);
    
    if (!response.ok) {
      throw new Error(`GBIF occurrence fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        totalCount: data.count,
        occurrences: data.results || [],
        countries: extractCountries(data.results)
      }
    };
    
  } catch (error) {
    console.error('GBIF Occurrence Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract unique countries from occurrence data
 * @param {Array} occurrences - Occurrence records
 * @returns {Array} List of countries
 */
function extractCountries(occurrences) {
  const countries = new Set();
  
  occurrences.forEach(occurrence => {
    if (occurrence.country) {
      countries.add(occurrence.country);
    }
  });
  
  return Array.from(countries);
}

/**
 * Get GBIF statistics
 * @returns {Promise<Object>} GBIF database statistics
 */
export async function getGBIFStats() {
  try {
    const response = await fetch(`${GBIF_BASE_URL}/species/count`);
    
    if (!response.ok) {
      throw new Error(`GBIF stats fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        totalSpecies: data.count,
        source: 'GBIF Database Statistics'
      }
    };
    
  } catch (error) {
    console.error('GBIF Stats Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 