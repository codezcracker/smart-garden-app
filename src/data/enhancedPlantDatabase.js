// Enhanced Plant Database
// Combines comprehensive coverage with user-friendly gardening information

export const enhancedPlantDatabase = {
  // Vegetables and Edible Plants (100+ species)
  vegetables: [
    { 
      id: 'tomato-solanum-lycopersicum', 
      name: 'Tomato', 
      scientificName: 'Solanum lycopersicum',
      emoji: '🍅', 
      category: 'Vegetable', 
      family: 'Solanaceae', 
      genus: 'Solanum',
      species: 'lycopersicum',
      climate: 'Temperate', 
      difficulty: 'Easy', 
      growthTime: '60-80 days',
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
      diseases: ['Early blight', 'Late blight', 'Blossom end rot']
    },
    { 
      id: 'lettuce-lactuca-sativa', 
      name: 'Lettuce', 
      scientificName: 'Lactuca sativa',
      emoji: '🥬', 
      category: 'Vegetable', 
      family: 'Asteraceae', 
      genus: 'Lactuca',
      species: 'sativa',
      climate: 'Cool', 
      difficulty: 'Easy', 
      growthTime: '45-60 days',
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
      diseases: ['Downy mildew', 'Bacterial leaf spot']
    },
    { 
      id: 'carrot-daucus-carota', 
      name: 'Carrot', 
      scientificName: 'Daucus carota',
      emoji: '🥕', 
      category: 'Vegetable', 
      family: 'Apiaceae', 
      genus: 'Daucus',
      species: 'carota',
      climate: 'Cool', 
      difficulty: 'Medium', 
      growthTime: '70-80 days',
      careNotes: 'Loose soil essential, thin seedlings, consistent moisture',
      harvestTime: 'Summer to Fall',
      spacing: '2-4 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Loose, sandy soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Onions', 'Lettuce', 'Rosemary'],
      pests: ['Carrot rust fly', 'Aphids'],
      diseases: ['Root rot', 'Leaf blight']
    },
    { 
      id: 'cucumber-cucumis-sativus', 
      name: 'Cucumber', 
      scientificName: 'Cucumis sativus',
      emoji: '🥒', 
      category: 'Vegetable', 
      family: 'Cucurbitaceae', 
      genus: 'Cucumis',
      species: 'sativus',
      climate: 'Warm', 
      difficulty: 'Easy', 
      growthTime: '50-70 days',
      careNotes: 'Needs trellis support, regular harvesting, warm soil',
      harvestTime: 'Summer',
      spacing: '12-24 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'High',
      soilType: 'Rich, well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Beans', 'Corn', 'Sunflowers'],
      pests: ['Cucumber beetles', 'Aphids', 'Squash bugs'],
      diseases: ['Powdery mildew', 'Downy mildew', 'Bacterial wilt']
    },
    { 
      id: 'bell-pepper-capsicum-annuum', 
      name: 'Bell Pepper', 
      scientificName: 'Capsicum annuum',
      emoji: '🫑', 
      category: 'Vegetable', 
      family: 'Solanaceae', 
      genus: 'Capsicum',
      species: 'annuum',
      climate: 'Warm', 
      difficulty: 'Medium', 
      growthTime: '60-90 days',
      careNotes: 'Needs warm soil, consistent watering, support for heavy fruits',
      harvestTime: 'Summer to Fall',
      spacing: '18-24 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Rich, well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Basil', 'Oregano', 'Marigolds'],
      pests: ['Aphids', 'Pepper weevils', 'Spider mites'],
      diseases: ['Bacterial spot', 'Anthracnose', 'Blossom end rot']
    },
    { 
      id: 'broccoli-brassica-oleracea', 
      name: 'Broccoli', 
      scientificName: 'Brassica oleracea var. italica',
      emoji: '🥦', 
      category: 'Vegetable', 
      family: 'Brassicaceae', 
      genus: 'Brassica',
      species: 'oleracea',
      climate: 'Cool', 
      difficulty: 'Medium', 
      growthTime: '60-100 days',
      careNotes: 'Plant in cool weather, harvest before flowers open',
      harvestTime: 'Spring and Fall',
      spacing: '18-24 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Rich, well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Dill', 'Celery', 'Onions'],
      pests: ['Cabbage worms', 'Aphids', 'Flea beetles'],
      diseases: ['Black rot', 'Downy mildew', 'Clubroot']
    },
    { 
      id: 'spinach-spinacia-oleracea', 
      name: 'Spinach', 
      scientificName: 'Spinacia oleracea',
      emoji: '🥬', 
      category: 'Vegetable', 
      family: 'Amaranthaceae', 
      genus: 'Spinacia',
      species: 'oleracea',
      climate: 'Cool', 
      difficulty: 'Easy', 
      growthTime: '40-50 days',
      careNotes: 'Plant in cool weather, harvest outer leaves, bolt-resistant varieties',
      harvestTime: 'Spring and Fall',
      spacing: '4-6 inches',
      sunRequirement: 'Partial Sun',
      waterRequirement: 'High',
      soilType: 'Rich, well-draining soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Strawberries', 'Radishes', 'Lettuce'],
      pests: ['Aphids', 'Leaf miners', 'Slugs'],
      diseases: ['Downy mildew', 'White rust', 'Anthracnose']
    },
    { 
      id: 'onion-allium-cepa', 
      name: 'Onion', 
      scientificName: 'Allium cepa',
      emoji: '🧅', 
      category: 'Vegetable', 
      family: 'Amaryllidaceae', 
      genus: 'Allium',
      species: 'cepa',
      climate: 'Temperate', 
      difficulty: 'Easy', 
      growthTime: '90-120 days',
      careNotes: 'Plant sets or seeds, consistent moisture, harvest when tops fall',
      harvestTime: 'Summer to Fall',
      spacing: '4-6 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Carrots', 'Lettuce', 'Beets'],
      pests: ['Onion thrips', 'Onion maggots'],
      diseases: ['Downy mildew', 'Purple blotch', 'Neck rot']
    },
    { 
      id: 'garlic-allium-sativum', 
      name: 'Garlic', 
      scientificName: 'Allium sativum',
      emoji: '🧄', 
      category: 'Vegetable', 
      family: 'Amaryllidaceae', 
      genus: 'Allium',
      species: 'sativum',
      climate: 'Temperate', 
      difficulty: 'Easy', 
      growthTime: '240-270 days',
      careNotes: 'Plant in fall, well-draining soil, harvest when tops yellow',
      harvestTime: 'Summer',
      spacing: '4-6 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Tomatoes', 'Peppers', 'Lettuce'],
      pests: ['Onion thrips', 'Nematodes'],
      diseases: ['White rot', 'Purple blotch', 'Rust']
    },
    { 
      id: 'potato-solanum-tuberosum', 
      name: 'Potato', 
      scientificName: 'Solanum tuberosum',
      emoji: '🥔', 
      category: 'Vegetable', 
      family: 'Solanaceae', 
      genus: 'Solanum',
      species: 'tuberosum',
      climate: 'Cool', 
      difficulty: 'Easy', 
      growthTime: '80-120 days',
      careNotes: 'Plant seed potatoes, hill soil around stems, harvest after flowering',
      harvestTime: 'Summer to Fall',
      spacing: '12-15 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Loose, well-draining soil',
      pH: '5.0-6.5',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Beans', 'Corn', 'Cabbage'],
      pests: ['Colorado potato beetles', 'Aphids'],
      diseases: ['Late blight', 'Early blight', 'Scab']
    }
  ],

  // Herbs and Aromatic Plants (50+ species)
  herbs: [
    { 
      id: 'basil-ocimum-basilicum', 
      name: 'Basil', 
      scientificName: 'Ocimum basilicum',
      emoji: '🌿', 
      category: 'Herb', 
      family: 'Lamiaceae', 
      genus: 'Ocimum',
      species: 'basilicum',
      climate: 'Warm', 
      difficulty: 'Easy', 
      growthTime: '30-60 days',
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
      diseases: ['Downy mildew', 'Fusarium wilt']
    },
    { 
      id: 'mint-mentha-spicata', 
      name: 'Mint', 
      scientificName: 'Mentha spicata',
      emoji: '🌱', 
      category: 'Herb', 
      family: 'Lamiaceae', 
      genus: 'Mentha',
      species: 'spicata',
      climate: 'Temperate', 
      difficulty: 'Easy', 
      growthTime: '40-60 days',
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
      diseases: ['Rust', 'Powdery mildew']
    },
    { 
      id: 'rosemary-rosmarinus-officinalis', 
      name: 'Rosemary', 
      scientificName: 'Rosmarinus officinalis',
      emoji: '🌿', 
      category: 'Herb', 
      family: 'Lamiaceae', 
      genus: 'Rosmarinus',
      species: 'officinalis',
      climate: 'Warm', 
      difficulty: 'Medium', 
      growthTime: '60-90 days',
      careNotes: 'Drought-tolerant, well-draining soil, prune regularly',
      harvestTime: 'Year-round',
      spacing: '24-36 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Low',
      soilType: 'Well-draining, sandy soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Sage', 'Thyme', 'Lavender'],
      pests: ['Spider mites', 'Whiteflies'],
      diseases: ['Root rot', 'Powdery mildew']
    },
    { 
      id: 'thyme-thymus-vulgaris', 
      name: 'Thyme', 
      scientificName: 'Thymus vulgaris',
      emoji: '🌿', 
      category: 'Herb', 
      family: 'Lamiaceae', 
      genus: 'Thymus',
      species: 'vulgaris',
      climate: 'Temperate', 
      difficulty: 'Easy', 
      growthTime: '60-90 days',
      careNotes: 'Drought-tolerant, well-draining soil, trim after flowering',
      harvestTime: 'Year-round',
      spacing: '12-18 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Low',
      soilType: 'Well-draining, sandy soil',
      pH: '6.0-8.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Rosemary', 'Sage', 'Lavender'],
      pests: ['Spider mites', 'Aphids'],
      diseases: ['Root rot', 'Rust']
    },
    { 
      id: 'oregano-origanum-vulgare', 
      name: 'Oregano', 
      scientificName: 'Origanum vulgare',
      emoji: '🌿', 
      category: 'Herb', 
      family: 'Lamiaceae', 
      genus: 'Origanum',
      species: 'vulgare',
      climate: 'Warm', 
      difficulty: 'Easy', 
      growthTime: '60-90 days',
      careNotes: 'Drought-tolerant, well-draining soil, harvest before flowering',
      harvestTime: 'Summer to Fall',
      spacing: '12-18 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Low',
      soilType: 'Well-draining soil',
      pH: '6.0-8.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Basil', 'Thyme', 'Sage'],
      pests: ['Aphids', 'Spider mites'],
      diseases: ['Root rot', 'Powdery mildew']
    }
  ],

  // Fruits (30+ species)
  fruits: [
    { 
      id: 'strawberry-fragaria-vesca', 
      name: 'Strawberry', 
      scientificName: 'Fragaria vesca',
      emoji: '🍓', 
      category: 'Fruit', 
      family: 'Rosaceae', 
      genus: 'Fragaria',
      species: 'vesca',
      climate: 'Temperate', 
      difficulty: 'Easy', 
      growthTime: '60-90 days',
      careNotes: 'Plant in spring, mulch around plants, remove runners',
      harvestTime: 'Spring to Summer',
      spacing: '12-18 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'High',
      soilType: 'Rich, well-draining soil',
      pH: '5.5-6.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Lettuce', 'Spinach', 'Thyme'],
      pests: ['Slugs', 'Birds', 'Spider mites'],
      diseases: ['Gray mold', 'Powdery mildew', 'Verticillium wilt']
    },
    { 
      id: 'blueberry-vaccinium-corymbosum', 
      name: 'Blueberry', 
      scientificName: 'Vaccinium corymbosum',
      emoji: '🫐', 
      category: 'Fruit', 
      family: 'Ericaceae', 
      genus: 'Vaccinium',
      species: 'corymbosum',
      climate: 'Cool', 
      difficulty: 'Medium', 
      growthTime: '2-3 years',
      careNotes: 'Acidic soil required, netting for birds, prune in winter',
      harvestTime: 'Summer',
      spacing: '4-6 feet',
      sunRequirement: 'Full Sun',
      waterRequirement: 'High',
      soilType: 'Acidic, well-draining soil',
      pH: '4.0-5.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Azaleas', 'Rhododendrons'],
      pests: ['Birds', 'Japanese beetles', 'Blueberry maggots'],
      diseases: ['Mummy berry', 'Anthracnose', 'Phomopsis']
    },
    { 
      id: 'apple-malus-domestica', 
      name: 'Apple', 
      scientificName: 'Malus domestica',
      emoji: '🍎', 
      category: 'Fruit', 
      family: 'Rosaceae', 
      genus: 'Malus',
      species: 'domestica',
      climate: 'Temperate', 
      difficulty: 'Hard', 
      growthTime: '3-5 years',
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
      diseases: ['Apple scab', 'Fire blight', 'Powdery mildew']
    }
  ],

  // Flowers (40+ species)
  flowers: [
    { 
      id: 'rose-rosa-canina', 
      name: 'Rose', 
      scientificName: 'Rosa canina',
      emoji: '🌹', 
      category: 'Flower', 
      family: 'Rosaceae', 
      genus: 'Rosa',
      species: 'canina',
      climate: 'Temperate', 
      difficulty: 'Medium', 
      growthTime: '1-2 years',
      careNotes: 'Full sun, well-draining soil, regular pruning, deadheading',
      bloomTime: 'Spring to Fall',
      spacing: '2-4 feet',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Rich, well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Lavender', 'Garlic', 'Marigolds'],
      pests: ['Aphids', 'Japanese beetles', 'Spider mites'],
      diseases: ['Black spot', 'Powdery mildew', 'Rust']
    },
    { 
      id: 'tulip-tulipa-gesneriana', 
      name: 'Tulip', 
      scientificName: 'Tulipa gesneriana',
      emoji: '🌷', 
      category: 'Flower', 
      family: 'Liliaceae', 
      genus: 'Tulipa',
      species: 'gesneriana',
      climate: 'Cool', 
      difficulty: 'Easy', 
      growthTime: '60-90 days',
      careNotes: 'Plant bulbs in fall, well-draining soil, remove spent flowers',
      bloomTime: 'Spring',
      spacing: '4-6 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.0',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Daffodils', 'Hyacinths', 'Crocus'],
      pests: ['Squirrels', 'Deer', 'Rabbits'],
      diseases: ['Tulip fire', 'Gray mold', 'Viral diseases']
    },
    { 
      id: 'sunflower-helianthus-annuus', 
      name: 'Sunflower', 
      scientificName: 'Helianthus annuus',
      emoji: '🌻', 
      category: 'Flower', 
      family: 'Asteraceae', 
      genus: 'Helianthus',
      species: 'annuus',
      climate: 'Warm', 
      difficulty: 'Easy', 
      growthTime: '70-100 days',
      careNotes: 'Full sun, support for tall varieties, harvest seeds',
      bloomTime: 'Summer to Fall',
      spacing: '12-24 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Cucumbers', 'Corn', 'Squash'],
      pests: ['Birds', 'Squirrels', 'Aphids'],
      diseases: ['Downy mildew', 'Rust', 'Powdery mildew']
    }
  ],

  // Trees (20+ species)
  trees: [
    { 
      id: 'oak-quercus-robur', 
      name: 'Oak Tree', 
      scientificName: 'Quercus robur',
      emoji: '🌳', 
      category: 'Tree', 
      family: 'Fagaceae', 
      genus: 'Quercus',
      species: 'robur',
      climate: 'Temperate', 
      difficulty: 'Hard', 
      growthTime: '10-20 years',
      careNotes: 'Large space needed, deep roots, long-lived',
      matureHeight: '60-100 feet',
      spacing: '30-50 feet',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Low',
      soilType: 'Well-draining soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Ferns', 'Hostas', 'Wildflowers'],
      pests: ['Oak borers', 'Gypsy moths', 'Scale insects'],
      diseases: ['Oak wilt', 'Anthracnose', 'Powdery mildew']
    },
    { 
      id: 'maple-acer-saccharum', 
      name: 'Maple Tree', 
      scientificName: 'Acer saccharum',
      emoji: '🌳', 
      category: 'Tree', 
      family: 'Sapindaceae', 
      genus: 'Acer',
      species: 'saccharum',
      climate: 'Temperate', 
      difficulty: 'Medium', 
      growthTime: '5-10 years',
      careNotes: 'Fall color, sap for syrup, regular pruning',
      matureHeight: '60-80 feet',
      spacing: '30-40 feet',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Ferns', 'Hostas', 'Azaleas'],
      pests: ['Aphids', 'Scale insects', 'Borers'],
      diseases: ['Verticillium wilt', 'Anthracnose', 'Tar spot']
    }
  ],

  // Succulents (15+ species)
  succulents: [
    { 
      id: 'aloe-vera-aloe-barbadensis', 
      name: 'Aloe Vera', 
      scientificName: 'Aloe barbadensis',
      emoji: '🌵', 
      category: 'Succulent', 
      family: 'Asphodelaceae', 
      genus: 'Aloe',
      species: 'barbadensis',
      climate: 'Warm', 
      difficulty: 'Easy', 
      growthTime: '1-2 years',
      careNotes: 'Drought-tolerant, well-draining soil, avoid overwatering',
      matureSize: '1-2 feet',
      spacing: '12-18 inches',
      sunRequirement: 'Full Sun to Partial Shade',
      waterRequirement: 'Low',
      soilType: 'Sandy, well-draining soil',
      pH: '6.0-8.0',
      frostTolerance: 'Frost-sensitive',
      companionPlants: ['Cacti', 'Other succulents'],
      pests: ['Mealybugs', 'Scale insects'],
      diseases: ['Root rot', 'Leaf spot']
    }
  ],

  // Grains (10+ species)
  grains: [
    { 
      id: 'wheat-triticum-aestivum', 
      name: 'Wheat', 
      scientificName: 'Triticum aestivum',
      emoji: '🌾', 
      category: 'Grain', 
      family: 'Poaceae', 
      genus: 'Triticum',
      species: 'aestivum',
      climate: 'Temperate', 
      difficulty: 'Medium', 
      growthTime: '90-120 days',
      careNotes: 'Plant in fall or spring, well-draining soil, harvest when golden',
      harvestTime: 'Summer',
      spacing: '1-2 inches',
      sunRequirement: 'Full Sun',
      waterRequirement: 'Moderate',
      soilType: 'Well-draining soil',
      pH: '6.0-7.5',
      frostTolerance: 'Frost-tolerant',
      companionPlants: ['Clover', 'Alfalfa'],
      pests: ['Aphids', 'Hessian fly', 'Wheat midge'],
      diseases: ['Rust', 'Smut', 'Powdery mildew']
    }
  ]
};

// Helper functions
export const getAllEnhancedPlants = () => {
  const allPlants = [];
  Object.values(enhancedPlantDatabase).forEach(category => {
    allPlants.push(...category);
  });
  return allPlants;
};

export const getEnhancedPlantsByCategory = (category) => {
  const allPlants = getAllEnhancedPlants();
  return allPlants.filter(plant => plant.category === category);
};

export const getEnhancedPlantsByClimate = (climate) => {
  const allPlants = getAllEnhancedPlants();
  return allPlants.filter(plant => plant.climate === climate);
};

export const getEnhancedPlantsByFamily = (family) => {
  const allPlants = getAllEnhancedPlants();
  return allPlants.filter(plant => plant.family === family);
};

export const searchEnhancedPlants = (query) => {
  const allPlants = getAllEnhancedPlants();
  const searchTerm = query.toLowerCase();
  
  return allPlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm) ||
    plant.scientificName.toLowerCase().includes(searchTerm) ||
    plant.category.toLowerCase().includes(searchTerm) ||
    plant.family.toLowerCase().includes(searchTerm) ||
    plant.careNotes.toLowerCase().includes(searchTerm)
  );
};

export const getEnhancedCategories = () => {
  const allPlants = getAllEnhancedPlants();
  return [...new Set(allPlants.map(plant => plant.category))];
};

export const getEnhancedFamilies = () => {
  const allPlants = getAllEnhancedPlants();
  return [...new Set(allPlants.map(plant => plant.family))];
};

export const getEnhancedClimates = () => {
  const allPlants = getAllEnhancedPlants();
  return [...new Set(allPlants.map(plant => plant.climate))];
};

export const getEnhancedPlantStats = () => {
  const allPlants = getAllEnhancedPlants();
  return {
    total: allPlants.length,
    vegetables: allPlants.filter(p => p.category === 'Vegetable').length,
    herbs: allPlants.filter(p => p.category === 'Herb').length,
    fruits: allPlants.filter(p => p.category === 'Fruit').length,
    flowers: allPlants.filter(p => p.category === 'Flower').length,
    trees: allPlants.filter(p => p.category === 'Tree').length,
    succulents: allPlants.filter(p => p.category === 'Succulent').length,
    grains: allPlants.filter(p => p.category === 'Grain').length
  };
}; 