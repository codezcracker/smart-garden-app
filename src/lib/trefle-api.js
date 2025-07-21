// Trefle API Integration
// Trefle - 1.4M+ species with care information

const TREFFLE_BASE_URL = 'https://trefle.io/api/v1';

// You'll need to get a token from https://trefle.io/
const TREFFLE_TOKEN = process.env.TREFFLE_API_TOKEN || 'demo';

/**
 * Search for a plant species in Trefle database
 * @param {string} plantName - Common or scientific name
 * @returns {Promise<Object>} Plant data from Trefle
 */
export async function searchTreflePlant(plantName) {
  try {
    const response = await fetch(
      `${TREFFLE_BASE_URL}/plants/search?q=${encodeURIComponent(plantName)}&token=${TREFFLE_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Trefle search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data.length === 0) {
      return {
        success: false,
        error: 'No plants found',
        source: 'Trefle'
      };
    }
    
    // Get detailed information for the best match
    const bestMatch = data.data[0];
    const detailedInfo = await getTreflePlantDetails(bestMatch.id);
    
    return {
      success: true,
      data: {
        // Basic info
        id: bestMatch.id,
        scientificName: bestMatch.scientific_name,
        commonNames: bestMatch.common_names || [],
        family: bestMatch.family,
        genus: bestMatch.genus,
        species: bestMatch.species,
        
        // Images
        images: bestMatch.images || [],
        imageUrl: bestMatch.image_url,
        
        // Distribution
        nativeStatus: bestMatch.native_status,
        year: bestMatch.year,
        
        // Detailed care info
        careInfo: detailedInfo.success ? detailedInfo.data : null,
        
        // Trefle metadata
        trefleId: bestMatch.id,
        slug: bestMatch.slug
      },
      source: 'Trefle (1.4M+ species)'
    };
    
  } catch (error) {
    console.error('Trefle API Error:', error);
    return {
      success: false,
      error: error.message,
      source: 'Trefle'
    };
  }
}

/**
 * Get detailed plant information from Trefle
 * @param {string} plantId - Trefle plant ID
 * @returns {Promise<Object>} Detailed plant data
 */
async function getTreflePlantDetails(plantId) {
  try {
    const response = await fetch(
      `${TREFFLE_BASE_URL}/plants/${plantId}?token=${TREFFLE_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Trefle details fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    const plant = data.data;
    
    return {
      success: true,
      data: {
        // Care information
        careNotes: plant.care_notes || 'Care information not available',
        growthHabit: plant.growth_habit,
        growthForm: plant.growth_form,
        growthRate: plant.growth_rate,
        
        // Environmental requirements
        lightRequirement: plant.light_requirement,
        waterRequirement: plant.water_requirement,
        soilRequirement: plant.soil_requirement,
        temperatureRequirement: plant.temperature_requirement,
        
        // Physical characteristics
        maxHeight: plant.max_height,
        minHeight: plant.min_height,
        maxSpread: plant.max_spread,
        minSpread: plant.min_spread,
        
        // Flowering and fruiting
        flowerColor: plant.flower_color,
        flowerTime: plant.flower_time,
        fruitColor: plant.fruit_color,
        fruitTime: plant.fruit_time,
        
        // Hardiness and climate
        hardinessZone: plant.hardiness_zone,
        climateZone: plant.climate_zone,
        
        // Additional info
        toxicity: plant.toxicity,
        edible: plant.edible,
        medicinal: plant.medicinal,
        ornamental: plant.ornamental,
        
        // Images
        images: plant.images || [],
        imageUrl: plant.image_url
      }
    };
    
  } catch (error) {
    console.error('Trefle Details Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get plant images from Trefle
 * @param {string} plantId - Trefle plant ID
 * @returns {Promise<Object>} Plant images
 */
export async function getTreflePlantImages(plantId) {
  try {
    const response = await fetch(
      `${TREFFLE_BASE_URL}/plants/${plantId}/images?token=${TREFFLE_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Trefle images fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        images: data.data || [],
        totalCount: data.data ? data.data.length : 0
      }
    };
    
  } catch (error) {
    console.error('Trefle Images Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Trefle statistics
 * @returns {Promise<Object>} Trefle database statistics
 */
export async function getTrefleStats() {
  try {
    const response = await fetch(
      `${TREFFLE_BASE_URL}/plants?token=${TREFFLE_TOKEN}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error(`Trefle stats fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        totalSpecies: data.meta ? data.meta.total : 'Unknown',
        source: 'Trefle Database Statistics'
      }
    };
    
  } catch (error) {
    console.error('Trefle Stats Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search plants by family
 * @param {string} familyName - Plant family name
 * @returns {Promise<Object>} Plants in the family
 */
export async function searchTrefleByFamily(familyName) {
  try {
    const response = await fetch(
      `${TREFFLE_BASE_URL}/plants?filter[family]=${encodeURIComponent(familyName)}&token=${TREFFLE_TOKEN}&limit=20`
    );
    
    if (!response.ok) {
      throw new Error(`Trefle family search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        plants: data.data || [],
        totalCount: data.meta ? data.meta.total : 0,
        family: familyName
      },
      source: 'Trefle (1.4M+ species)'
    };
    
  } catch (error) {
    console.error('Trefle Family Search Error:', error);
    return {
      success: false,
      error: error.message,
      source: 'Trefle'
    };
  }
} 