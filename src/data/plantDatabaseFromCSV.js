// Plant Database generated from classification.csv
// This represents a comprehensive database of plant species

export const plantDatabaseFromCSV = {
  // Major Plant Groups
  floweringPlants: {
    // Vegetables and Edible Plants
    vegetables: [
      { id: 'tomato-solanum-lycopersicum', name: 'Tomato', scientificName: 'Solanum lycopersicum', emoji: '🍅', category: 'Vegetable', family: 'Solanaceae', genus: 'Solanum', species: 'lycopersicum', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-80 days' },
      { id: 'lettuce-lactuca-sativa', name: 'Lettuce', scientificName: 'Lactuca sativa', emoji: '🥬', category: 'Vegetable', family: 'Asteraceae', genus: 'Lactuca', species: 'sativa', climate: 'Cool', difficulty: 'Easy', growthTime: '45-60 days' },
      { id: 'carrot-daucus-carota', name: 'Carrot', scientificName: 'Daucus carota', emoji: '🥕', category: 'Vegetable', family: 'Apiaceae', genus: 'Daucus', species: 'carota', climate: 'Cool', difficulty: 'Medium', growthTime: '70-80 days' },
      { id: 'cucumber-cucumis-sativus', name: 'Cucumber', scientificName: 'Cucumis sativus', emoji: '🥒', category: 'Vegetable', family: 'Cucurbitaceae', genus: 'Cucumis', species: 'sativus', climate: 'Warm', difficulty: 'Easy', growthTime: '50-70 days' },
      { id: 'bell-pepper-capsicum-annuum', name: 'Bell Pepper', scientificName: 'Capsicum annuum', emoji: '🫑', category: 'Vegetable', family: 'Solanaceae', genus: 'Capsicum', species: 'annuum', climate: 'Warm', difficulty: 'Medium', growthTime: '60-90 days' },
      { id: 'broccoli-brassica-oleracea', name: 'Broccoli', scientificName: 'Brassica oleracea', emoji: '🥦', category: 'Vegetable', family: 'Brassicaceae', genus: 'Brassica', species: 'oleracea', climate: 'Cool', difficulty: 'Medium', growthTime: '60-100 days' },
      { id: 'spinach-spinacia-oleracea', name: 'Spinach', scientificName: 'Spinacia oleracea', emoji: '🥬', category: 'Vegetable', family: 'Amaranthaceae', genus: 'Spinacia', species: 'oleracea', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' },
      { id: 'onion-allium-cepa', name: 'Onion', scientificName: 'Allium cepa', emoji: '🧅', category: 'Vegetable', family: 'Amaryllidaceae', genus: 'Allium', species: 'cepa', climate: 'Temperate', difficulty: 'Easy', growthTime: '90-120 days' },
      { id: 'garlic-allium-sativum', name: 'Garlic', scientificName: 'Allium sativum', emoji: '🧄', category: 'Vegetable', family: 'Amaryllidaceae', genus: 'Allium', species: 'sativum', climate: 'Temperate', difficulty: 'Easy', growthTime: '240-270 days' },
      { id: 'potato-solanum-tuberosum', name: 'Potato', scientificName: 'Solanum tuberosum', emoji: '🥔', category: 'Vegetable', family: 'Solanaceae', genus: 'Solanum', species: 'tuberosum', climate: 'Cool', difficulty: 'Easy', growthTime: '80-120 days' }
    ],

    // Herbs and Aromatic Plants
    herbs: [
      { id: 'basil-ocimum-basilicum', name: 'Basil', scientificName: 'Ocimum basilicum', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', genus: 'Ocimum', species: 'basilicum', climate: 'Warm', difficulty: 'Easy', growthTime: '30-60 days' },
      { id: 'mint-mentha', name: 'Mint', scientificName: 'Mentha', emoji: '🌱', category: 'Herb', family: 'Lamiaceae', genus: 'Mentha', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'rosemary-rosmarinus-officinalis', name: 'Rosemary', scientificName: 'Rosmarinus officinalis', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', genus: 'Rosmarinus', species: 'officinalis', climate: 'Warm', difficulty: 'Medium', growthTime: '60-90 days' },
      { id: 'thyme-thymus', name: 'Thyme', scientificName: 'Thymus', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', genus: 'Thymus', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'oregano-origanum-vulgare', name: 'Oregano', scientificName: 'Origanum vulgare', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', genus: 'Origanum', species: 'vulgare', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'sage-salvia-officinalis', name: 'Sage', scientificName: 'Salvia officinalis', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', genus: 'Salvia', species: 'officinalis', climate: 'Temperate', difficulty: 'Medium', growthTime: '75-80 days' },
      { id: 'parsley-petroselinum-crispum', name: 'Parsley', scientificName: 'Petroselinum crispum', emoji: '🌿', category: 'Herb', family: 'Apiaceae', genus: 'Petroselinum', species: 'crispum', climate: 'Cool', difficulty: 'Easy', growthTime: '70-90 days' },
      { id: 'cilantro-coriandrum-sativum', name: 'Cilantro', scientificName: 'Coriandrum sativum', emoji: '🌿', category: 'Herb', family: 'Apiaceae', genus: 'Coriandrum', species: 'sativum', climate: 'Cool', difficulty: 'Easy', growthTime: '30-45 days' },
      { id: 'dill-anethum-graveolens', name: 'Dill', scientificName: 'Anethum graveolens', emoji: '🌿', category: 'Herb', family: 'Apiaceae', genus: 'Anethum', species: 'graveolens', climate: 'Cool', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'chives-allium-schoenoprasum', name: 'Chives', scientificName: 'Allium schoenoprasum', emoji: '🌿', category: 'Herb', family: 'Amaryllidaceae', genus: 'Allium', species: 'schoenoprasum', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' }
    ],

    // Fruits
    fruits: [
      { id: 'strawberry-fragaria', name: 'Strawberry', scientificName: 'Fragaria', emoji: '🍓', category: 'Fruit', family: 'Rosaceae', genus: 'Fragaria', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'blueberry-vaccinium', name: 'Blueberry', scientificName: 'Vaccinium', emoji: '🫐', category: 'Fruit', family: 'Ericaceae', genus: 'Vaccinium', species: 'spp', climate: 'Cool', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'raspberry-rubus', name: 'Raspberry', scientificName: 'Rubus', emoji: '🫐', category: 'Fruit', family: 'Rosaceae', genus: 'Rubus', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'apple-malus-domestica', name: 'Apple', scientificName: 'Malus domestica', emoji: '🍎', category: 'Fruit', family: 'Rosaceae', genus: 'Malus', species: 'domestica', climate: 'Temperate', difficulty: 'Hard', growthTime: '3-5 years' },
      { id: 'pear-pyrus', name: 'Pear', scientificName: 'Pyrus', emoji: '🍐', category: 'Fruit', family: 'Rosaceae', genus: 'Pyrus', species: 'spp', climate: 'Temperate', difficulty: 'Hard', growthTime: '3-5 years' },
      { id: 'cherry-prunus', name: 'Cherry', scientificName: 'Prunus', emoji: '🍒', category: 'Fruit', family: 'Rosaceae', genus: 'Prunus', species: 'spp', climate: 'Temperate', difficulty: 'Hard', growthTime: '3-4 years' },
      { id: 'peach-prunus-persica', name: 'Peach', scientificName: 'Prunus persica', emoji: '🍑', category: 'Fruit', family: 'Rosaceae', genus: 'Prunus', species: 'persica', climate: 'Warm', difficulty: 'Medium', growthTime: '2-4 years' },
      { id: 'grape-vitis', name: 'Grape', scientificName: 'Vitis', emoji: '🍇', category: 'Fruit', family: 'Vitaceae', genus: 'Vitis', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'fig-ficus-carica', name: 'Fig', scientificName: 'Ficus carica', emoji: '🫐', category: 'Fruit', family: 'Moraceae', genus: 'Ficus', species: 'carica', climate: 'Warm', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'pomegranate-punica-granatum', name: 'Pomegranate', scientificName: 'Punica granatum', emoji: '🫐', category: 'Fruit', family: 'Lythraceae', genus: 'Punica', species: 'granatum', climate: 'Warm', difficulty: 'Medium', growthTime: '2-3 years' }
    ],

    // Ornamental Flowers
    flowers: [
      { id: 'rose-rosa', name: 'Rose', scientificName: 'Rosa', emoji: '🌹', category: 'Flower', family: 'Rosaceae', genus: 'Rosa', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'tulip-tulipa', name: 'Tulip', scientificName: 'Tulipa', emoji: '🌷', category: 'Flower', family: 'Liliaceae', genus: 'Tulipa', species: 'spp', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'daffodil-narcissus', name: 'Daffodil', scientificName: 'Narcissus', emoji: '🌼', category: 'Flower', family: 'Amaryllidaceae', genus: 'Narcissus', species: 'spp', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'sunflower-helianthus-annuus', name: 'Sunflower', scientificName: 'Helianthus annuus', emoji: '🌻', category: 'Flower', family: 'Asteraceae', genus: 'Helianthus', species: 'annuus', climate: 'Warm', difficulty: 'Easy', growthTime: '70-100 days' },
      { id: 'marigold-tagetes', name: 'Marigold', scientificName: 'Tagetes', emoji: '🌼', category: 'Flower', family: 'Asteraceae', genus: 'Tagetes', species: 'spp', climate: 'Warm', difficulty: 'Easy', growthTime: '50-80 days' },
      { id: 'zinnia-zinnia', name: 'Zinnia', scientificName: 'Zinnia', emoji: '🌼', category: 'Flower', family: 'Asteraceae', genus: 'Zinnia', species: 'spp', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'petunia-petunia', name: 'Petunia', scientificName: 'Petunia', emoji: '🌸', category: 'Flower', family: 'Solanaceae', genus: 'Petunia', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'daisy-bellis-perennis', name: 'Daisy', scientificName: 'Bellis perennis', emoji: '🌼', category: 'Flower', family: 'Asteraceae', genus: 'Bellis', species: 'perennis', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'lily-lilium', name: 'Lily', scientificName: 'Lilium', emoji: '🌸', category: 'Flower', family: 'Liliaceae', genus: 'Lilium', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'orchid-orchidaceae', name: 'Orchid', scientificName: 'Orchidaceae', emoji: '🌸', category: 'Flower', family: 'Orchidaceae', genus: 'Various', species: 'spp', climate: 'Warm', difficulty: 'Hard', growthTime: '1-3 years' }
    ],

    // Leafy Greens
    leafyGreens: [
      { id: 'kale-brassica-oleracea-acephala', name: 'Kale', scientificName: 'Brassica oleracea var. acephala', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', genus: 'Brassica', species: 'oleracea', climate: 'Cool', difficulty: 'Easy', growthTime: '50-65 days' },
      { id: 'arugula-eruca-vesicaria', name: 'Arugula', scientificName: 'Eruca vesicaria', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', genus: 'Eruca', species: 'vesicaria', climate: 'Cool', difficulty: 'Easy', growthTime: '30-40 days' },
      { id: 'swiss-chard-beta-vulgaris', name: 'Swiss Chard', scientificName: 'Beta vulgaris subsp. cicla', emoji: '🥬', category: 'Leafy Green', family: 'Amaranthaceae', genus: 'Beta', species: 'vulgaris', climate: 'Cool', difficulty: 'Easy', growthTime: '50-60 days' },
      { id: 'collard-greens-brassica-oleracea', name: 'Collard Greens', scientificName: 'Brassica oleracea var. viridis', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', genus: 'Brassica', species: 'oleracea', climate: 'Cool', difficulty: 'Easy', growthTime: '60-75 days' },
      { id: 'mustard-greens-brassica-juncea', name: 'Mustard Greens', scientificName: 'Brassica juncea', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', genus: 'Brassica', species: 'juncea', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' }
    ]
  },

  // Non-Flowering Plants
  nonFloweringPlants: {
    // Ferns
    ferns: [
      { id: 'maidenhair-fern-adiantum', name: 'Maidenhair Fern', scientificName: 'Adiantum', emoji: '🌿', category: 'Fern', family: 'Pteridaceae', genus: 'Adiantum', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'boston-fern-nephrolepis-exaltata', name: 'Boston Fern', scientificName: 'Nephrolepis exaltata', emoji: '🌿', category: 'Fern', family: 'Nephrolepidaceae', genus: 'Nephrolepis', species: 'exaltata', climate: 'Warm', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'staghorn-fern-platycerium', name: 'Staghorn Fern', scientificName: 'Platycerium', emoji: '🌿', category: 'Fern', family: 'Polypodiaceae', genus: 'Platycerium', species: 'spp', climate: 'Warm', difficulty: 'Hard', growthTime: '2-3 years' },
      { id: 'birds-nest-fern-asplenium-nidus', name: 'Bird\'s Nest Fern', scientificName: 'Asplenium nidus', emoji: '🌿', category: 'Fern', family: 'Aspleniaceae', genus: 'Asplenium', species: 'nidus', climate: 'Warm', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'leather-leaf-fern-rumohra-adiantiformis', name: 'Leather Leaf Fern', scientificName: 'Rumohra adiantiformis', emoji: '🌿', category: 'Fern', family: 'Dryopteridaceae', genus: 'Rumohra', species: 'adiantiformis', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' }
    ],

    // Mosses
    mosses: [
      { id: 'sphagnum-moss-sphagnum', name: 'Sphagnum Moss', scientificName: 'Sphagnum', emoji: '🌿', category: 'Moss', family: 'Sphagnaceae', genus: 'Sphagnum', species: 'spp', climate: 'Cool', difficulty: 'Medium', growthTime: '6-12 months' },
      { id: 'sheet-moss-hypnum', name: 'Sheet Moss', scientificName: 'Hypnum', emoji: '🌿', category: 'Moss', family: 'Hypnaceae', genus: 'Hypnum', species: 'spp', climate: 'Cool', difficulty: 'Easy', growthTime: '6-12 months' },
      { id: 'cushion-moss-leucobryum', name: 'Cushion Moss', scientificName: 'Leucobryum', emoji: '🌿', category: 'Moss', family: 'Leucobryaceae', genus: 'Leucobryum', species: 'spp', climate: 'Cool', difficulty: 'Medium', growthTime: '6-12 months' }
    ]
  },

  // Succulents and Cacti
  succulents: [
    { id: 'aloe-vera-aloe-barbadensis', name: 'Aloe Vera', scientificName: 'Aloe barbadensis', emoji: '🌵', category: 'Succulent', family: 'Asphodelaceae', genus: 'Aloe', species: 'barbadensis', climate: 'Warm', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'jade-plant-crassula-ovata', name: 'Jade Plant', scientificName: 'Crassula ovata', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', genus: 'Crassula', species: 'ovata', climate: 'Warm', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'echeveria-echeveria', name: 'Echeveria', scientificName: 'Echeveria', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', genus: 'Echeveria', species: 'spp', climate: 'Warm', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'sedum-sedum', name: 'Sedum', scientificName: 'Sedum', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', genus: 'Sedum', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'sempervivum-sempervivum', name: 'Sempervivum', scientificName: 'Sempervivum', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', genus: 'Sempervivum', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'agave-agave', name: 'Agave', scientificName: 'Agave', emoji: '🌵', category: 'Succulent', family: 'Asparagaceae', genus: 'Agave', species: 'spp', climate: 'Warm', difficulty: 'Medium', growthTime: '3-5 years' },
    { id: 'cactus-cactaceae', name: 'Cactus', scientificName: 'Cactaceae', emoji: '🌵', category: 'Cactus', family: 'Cactaceae', genus: 'Various', species: 'spp', climate: 'Warm', difficulty: 'Easy', growthTime: '1-3 years' }
  ],

  // Trees and Shrubs
  trees: [
    { id: 'oak-quercus', name: 'Oak Tree', scientificName: 'Quercus', emoji: '🌳', category: 'Tree', family: 'Fagaceae', genus: 'Quercus', species: 'spp', climate: 'Temperate', difficulty: 'Hard', growthTime: '10-20 years' },
    { id: 'maple-acer', name: 'Maple Tree', scientificName: 'Acer', emoji: '🌳', category: 'Tree', family: 'Sapindaceae', genus: 'Acer', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '5-10 years' },
    { id: 'birch-betula', name: 'Birch Tree', scientificName: 'Betula', emoji: '🌳', category: 'Tree', family: 'Betulaceae', genus: 'Betula', species: 'spp', climate: 'Cool', difficulty: 'Medium', growthTime: '5-10 years' },
    { id: 'willow-salix', name: 'Willow Tree', scientificName: 'Salix', emoji: '🌳', category: 'Tree', family: 'Salicaceae', genus: 'Salix', species: 'spp', climate: 'Temperate', difficulty: 'Easy', growthTime: '3-5 years' },
    { id: 'pine-pinus', name: 'Pine Tree', scientificName: 'Pinus', emoji: '🌲', category: 'Tree', family: 'Pinaceae', genus: 'Pinus', species: 'spp', climate: 'Cool', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'spruce-picea', name: 'Spruce Tree', scientificName: 'Picea', emoji: '🌲', category: 'Tree', family: 'Pinaceae', genus: 'Picea', species: 'spp', climate: 'Cool', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'cedar-cedrus', name: 'Cedar Tree', scientificName: 'Cedrus', emoji: '🌲', category: 'Tree', family: 'Pinaceae', genus: 'Cedrus', species: 'spp', climate: 'Temperate', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'cypress-cupressus', name: 'Cypress Tree', scientificName: 'Cupressus', emoji: '🌲', category: 'Tree', family: 'Cupressaceae', genus: 'Cupressus', species: 'spp', climate: 'Warm', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'palm-arecaceae', name: 'Palm Tree', scientificName: 'Arecaceae', emoji: '🌴', category: 'Tree', family: 'Arecaceae', genus: 'Various', species: 'spp', climate: 'Warm', difficulty: 'Medium', growthTime: '5-10 years' },
    { id: 'bamboo-bambusoideae', name: 'Bamboo', scientificName: 'Bambusoideae', emoji: '🎋', category: 'Tree', family: 'Poaceae', genus: 'Various', species: 'spp', climate: 'Warm', difficulty: 'Easy', growthTime: '2-5 years' }
  ],

  // Grasses and Grains
  grasses: [
    { id: 'wheat-triticum-aestivum', name: 'Wheat', scientificName: 'Triticum aestivum', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Triticum', species: 'aestivum', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'corn-zea-mays', name: 'Corn', scientificName: 'Zea mays', emoji: '🌽', category: 'Grain', family: 'Poaceae', genus: 'Zea', species: 'mays', climate: 'Warm', difficulty: 'Medium', growthTime: '60-100 days' },
    { id: 'rice-oryza-sativa', name: 'Rice', scientificName: 'Oryza sativa', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Oryza', species: 'sativa', climate: 'Warm', difficulty: 'Medium', growthTime: '100-150 days' },
    { id: 'oats-avena-sativa', name: 'Oats', scientificName: 'Avena sativa', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Avena', species: 'sativa', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'barley-hordeum-vulgare', name: 'Barley', scientificName: 'Hordeum vulgare', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Hordeum', species: 'vulgare', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'rye-secale-cereale', name: 'Rye', scientificName: 'Secale cereale', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Secale', species: 'cereale', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'sorghum-sorghum-bicolor', name: 'Sorghum', scientificName: 'Sorghum bicolor', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Sorghum', species: 'bicolor', climate: 'Warm', difficulty: 'Medium', growthTime: '100-120 days' },
    { id: 'millet-panicum-miliaceum', name: 'Millet', scientificName: 'Panicum miliaceum', emoji: '🌾', category: 'Grain', family: 'Poaceae', genus: 'Panicum', species: 'miliaceum', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
    { id: 'quinoa-chenopodium-quinoa', name: 'Quinoa', scientificName: 'Chenopodium quinoa', emoji: '🌾', category: 'Grain', family: 'Amaranthaceae', genus: 'Chenopodium', species: 'quinoa', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'amaranth-grain-amaranthus', name: 'Amaranth Grain', scientificName: 'Amaranthus', emoji: '🌾', category: 'Grain', family: 'Amaranthaceae', genus: 'Amaranthus', species: 'spp', climate: 'Warm', difficulty: 'Easy', growthTime: '90-120 days' }
  ]
};

// Helper function to get all plants from CSV-based database
export const getAllPlantsFromCSV = () => {
  const allPlants = [];
  
  // Add flowering plants
  Object.values(plantDatabaseFromCSV.floweringPlants).forEach(category => {
    allPlants.push(...category);
  });
  
  // Add non-flowering plants
  Object.values(plantDatabaseFromCSV.nonFloweringPlants).forEach(category => {
    allPlants.push(...category);
  });
  
  // Add succulents
  allPlants.push(...plantDatabaseFromCSV.succulents);
  
  // Add trees
  allPlants.push(...plantDatabaseFromCSV.trees);
  
  // Add grasses
  allPlants.push(...plantDatabaseFromCSV.grasses);
  
  return allPlants;
};

// Helper function to get plants by category from CSV-based database
export const getPlantsByCategoryFromCSV = (category) => {
  const allPlants = getAllPlantsFromCSV();
  return allPlants.filter(plant => plant.category === category);
};

// Helper function to get plants by climate from CSV-based database
export const getPlantsByClimateFromCSV = (climate) => {
  const allPlants = getAllPlantsFromCSV();
  return allPlants.filter(plant => plant.climate === climate);
};

// Helper function to get plants by family from CSV-based database
export const getPlantsByFamilyFromCSV = (family) => {
  const allPlants = getAllPlantsFromCSV();
  return allPlants.filter(plant => plant.family === family);
};

// Helper function to search plants from CSV-based database
export const searchPlantsFromCSV = (query) => {
  const allPlants = getAllPlantsFromCSV();
  const searchTerm = query.toLowerCase();
  
  return allPlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm) ||
    plant.scientificName.toLowerCase().includes(searchTerm) ||
    plant.category.toLowerCase().includes(searchTerm) ||
    plant.family.toLowerCase().includes(searchTerm) ||
    plant.genus.toLowerCase().includes(searchTerm) ||
    plant.species.toLowerCase().includes(searchTerm) ||
    plant.climate.toLowerCase().includes(searchTerm)
  );
};

// Get unique categories from CSV-based database
export const getCategoriesFromCSV = () => {
  const allPlants = getAllPlantsFromCSV();
  return [...new Set(allPlants.map(plant => plant.category))];
};

// Get unique families from CSV-based database
export const getFamiliesFromCSV = () => {
  const allPlants = getAllPlantsFromCSV();
  return [...new Set(allPlants.map(plant => plant.family))];
};

// Get unique climates from CSV-based database
export const getClimatesFromCSV = () => {
  const allPlants = getAllPlantsFromCSV();
  return [...new Set(allPlants.map(plant => plant.climate))];
};

// Get unique genera from CSV-based database
export const getGeneraFromCSV = () => {
  const allPlants = getAllPlantsFromCSV();
  return [...new Set(allPlants.map(plant => plant.genus))];
};

// Get plant statistics from CSV-based database
export const getPlantStatsFromCSV = () => {
  const allPlants = getAllPlantsFromCSV();
  return {
    total: allPlants.length,
    vegetables: allPlants.filter(p => p.category === 'Vegetable').length,
    herbs: allPlants.filter(p => p.category === 'Herb').length,
    fruits: allPlants.filter(p => p.category === 'Fruit').length,
    flowers: allPlants.filter(p => p.category === 'Flower').length,
    leafyGreens: allPlants.filter(p => p.category === 'Leafy Green').length,
    trees: allPlants.filter(p => p.category === 'Tree').length,
    succulents: allPlants.filter(p => p.category === 'Succulent').length,
    ferns: allPlants.filter(p => p.category === 'Fern').length,
    mosses: allPlants.filter(p => p.category === 'Moss').length,
    grains: allPlants.filter(p => p.category === 'Grain').length,
    cacti: allPlants.filter(p => p.category === 'Cactus').length
  };
}; 