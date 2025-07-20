// Comprehensive Plant Database
// Representing the vast diversity of ~391,000 known plant species

export const plantDatabase = {
  // Flowering Plants (Angiosperms) - ~369,000 species
  floweringPlants: {
    // Vegetables and Edible Plants
    vegetables: [
      { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Vegetable', family: 'Solanaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-80 days' },
      { id: 'lettuce', name: 'Lettuce', emoji: '🥬', category: 'Vegetable', family: 'Asteraceae', climate: 'Cool', difficulty: 'Easy', growthTime: '45-60 days' },
      { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'Vegetable', family: 'Apiaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '70-80 days' },
      { id: 'cucumber', name: 'Cucumber', emoji: '🥒', category: 'Vegetable', family: 'Cucurbitaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '50-70 days' },
      { id: 'bell-pepper', name: 'Bell Pepper', emoji: '🫑', category: 'Vegetable', family: 'Solanaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '60-90 days' },
      { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'Vegetable', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '60-100 days' },
      { id: 'spinach', name: 'Spinach', emoji: '🥬', category: 'Vegetable', family: 'Amaranthaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' },
      { id: 'onion', name: 'Onion', emoji: '🧅', category: 'Vegetable', family: 'Amaryllidaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '90-120 days' },
      { id: 'garlic', name: 'Garlic', emoji: '🧄', category: 'Vegetable', family: 'Amaryllidaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '240-270 days' },
      { id: 'potato', name: 'Potato', emoji: '🥔', category: 'Vegetable', family: 'Solanaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '80-120 days' },
      { id: 'sweet-potato', name: 'Sweet Potato', emoji: '🍠', category: 'Vegetable', family: 'Convolvulaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '100-150 days' },
      { id: 'cauliflower', name: 'Cauliflower', emoji: '🥬', category: 'Vegetable', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '60-100 days' },
      { id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: 'Vegetable', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'radish', name: 'Radish', emoji: '🥬', category: 'Vegetable', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '20-30 days' },
      { id: 'beetroot', name: 'Beetroot', emoji: '🥬', category: 'Vegetable', family: 'Amaranthaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '50-70 days' },
      { id: 'turnip', name: 'Turnip', emoji: '🥬', category: 'Vegetable', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'parsnip', name: 'Parsnip', emoji: '🥬', category: 'Vegetable', family: 'Apiaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '100-130 days' },
      { id: 'celery', name: 'Celery', emoji: '🥬', category: 'Vegetable', family: 'Apiaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '120-140 days' },
      { id: 'asparagus', name: 'Asparagus', emoji: '🥬', category: 'Vegetable', family: 'Asparagaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'artichoke', name: 'Artichoke', emoji: '🥬', category: 'Vegetable', family: 'Asteraceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '150-180 days' }
    ],

    // Herbs and Aromatic Plants
    herbs: [
      { id: 'basil', name: 'Basil', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '30-60 days' },
      { id: 'mint', name: 'Mint', emoji: '🌱', category: 'Herb', family: 'Lamiaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'rosemary', name: 'Rosemary', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '60-90 days' },
      { id: 'thyme', name: 'Thyme', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'oregano', name: 'Oregano', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'sage', name: 'Sage', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '75-80 days' },
      { id: 'parsley', name: 'Parsley', emoji: '🌿', category: 'Herb', family: 'Apiaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '70-90 days' },
      { id: 'cilantro', name: 'Cilantro', emoji: '🌿', category: 'Herb', family: 'Apiaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '30-45 days' },
      { id: 'dill', name: 'Dill', emoji: '🌿', category: 'Herb', family: 'Apiaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'chives', name: 'Chives', emoji: '🌿', category: 'Herb', family: 'Amaryllidaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'bay-leaf', name: 'Bay Leaf', emoji: '🌿', category: 'Herb', family: 'Lauraceae', climate: 'Warm', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'tarragon', name: 'Tarragon', emoji: '🌿', category: 'Herb', family: 'Asteraceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '60-90 days' },
      { id: 'marjoram', name: 'Marjoram', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'lavender', name: 'Lavender', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'lemon-balm', name: 'Lemon Balm', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'catnip', name: 'Catnip', emoji: '🌿', category: 'Herb', family: 'Lamiaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'chamomile', name: 'Chamomile', emoji: '🌼', category: 'Herb', family: 'Asteraceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'fennel', name: 'Fennel', emoji: '🌿', category: 'Herb', family: 'Apiaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'lemon-grass', name: 'Lemongrass', emoji: '🌿', category: 'Herb', family: 'Poaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'stevia', name: 'Stevia', emoji: '🌿', category: 'Herb', family: 'Asteraceae', climate: 'Warm', difficulty: 'Medium', growthTime: '90-120 days' }
    ],

    // Fruits
    fruits: [
      { id: 'strawberry', name: 'Strawberry', emoji: '🍓', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'blueberry', name: 'Blueberry', emoji: '🫐', category: 'Fruit', family: 'Ericaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'raspberry', name: 'Raspberry', emoji: '🫐', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'blackberry', name: 'Blackberry', emoji: '🫐', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '1-2 years' },
      { id: 'apple', name: 'Apple', emoji: '🍎', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Hard', growthTime: '3-5 years' },
      { id: 'pear', name: 'Pear', emoji: '🍐', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Hard', growthTime: '3-5 years' },
      { id: 'cherry', name: 'Cherry', emoji: '🍒', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Hard', growthTime: '3-4 years' },
      { id: 'peach', name: 'Peach', emoji: '🍑', category: 'Fruit', family: 'Rosaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '2-4 years' },
      { id: 'plum', name: 'Plum', emoji: '🫐', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '3-5 years' },
      { id: 'fig', name: 'Fig', emoji: '🫐', category: 'Fruit', family: 'Moraceae', climate: 'Warm', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'grape', name: 'Grape', emoji: '🍇', category: 'Fruit', family: 'Vitaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'kiwi', name: 'Kiwi', emoji: '🥝', category: 'Fruit', family: 'Actinidiaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '3-5 years' },
      { id: 'pomegranate', name: 'Pomegranate', emoji: '🫐', category: 'Fruit', family: 'Lythraceae', climate: 'Warm', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'persimmon', name: 'Persimmon', emoji: '🫐', category: 'Fruit', family: 'Ebenaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '3-5 years' },
      { id: 'mulberry', name: 'Mulberry', emoji: '🫐', category: 'Fruit', family: 'Moraceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '2-3 years' },
      { id: 'gooseberry', name: 'Gooseberry', emoji: '🫐', category: 'Fruit', family: 'Grossulariaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'currant', name: 'Currant', emoji: '🫐', category: 'Fruit', family: 'Grossulariaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'elderberry', name: 'Elderberry', emoji: '🫐', category: 'Fruit', family: 'Adoxaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '2-3 years' },
      { id: 'serviceberry', name: 'Serviceberry', emoji: '🫐', category: 'Fruit', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'pawpaw', name: 'Pawpaw', emoji: '🫐', category: 'Fruit', family: 'Annonaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '3-5 years' }
    ],

    // Ornamental Flowers
    flowers: [
      { id: 'rose', name: 'Rose', emoji: '🌹', category: 'Flower', family: 'Rosaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'tulip', name: 'Tulip', emoji: '🌷', category: 'Flower', family: 'Liliaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'daffodil', name: 'Daffodil', emoji: '🌼', category: 'Flower', family: 'Amaryllidaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'sunflower', name: 'Sunflower', emoji: '🌻', category: 'Flower', family: 'Asteraceae', climate: 'Warm', difficulty: 'Easy', growthTime: '70-100 days' },
      { id: 'marigold', name: 'Marigold', emoji: '🌼', category: 'Flower', family: 'Asteraceae', climate: 'Warm', difficulty: 'Easy', growthTime: '50-80 days' },
      { id: 'zinnia', name: 'Zinnia', emoji: '🌼', category: 'Flower', family: 'Asteraceae', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'petunia', name: 'Petunia', emoji: '🌸', category: 'Flower', family: 'Solanaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'daisy', name: 'Daisy', emoji: '🌼', category: 'Flower', family: 'Asteraceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'lily', name: 'Lily', emoji: '🌸', category: 'Flower', family: 'Liliaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'orchid', name: 'Orchid', emoji: '🌸', category: 'Flower', family: 'Orchidaceae', climate: 'Warm', difficulty: 'Hard', growthTime: '1-3 years' },
      { id: 'carnation', name: 'Carnation', emoji: '🌸', category: 'Flower', family: 'Caryophyllaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'chrysanthemum', name: 'Chrysanthemum', emoji: '🌼', category: 'Flower', family: 'Asteraceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'peony', name: 'Peony', emoji: '🌸', category: 'Flower', family: 'Paeoniaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '2-3 years' },
      { id: 'iris', name: 'Iris', emoji: '🌸', category: 'Flower', family: 'Iridaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'dahlia', name: 'Dahlia', emoji: '🌸', category: 'Flower', family: 'Asteraceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
      { id: 'begonia', name: 'Begonia', emoji: '🌸', category: 'Flower', family: 'Begoniaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '60-90 days' },
      { id: 'geranium', name: 'Geranium', emoji: '🌸', category: 'Flower', family: 'Geraniaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'impatiens', name: 'Impatiens', emoji: '🌸', category: 'Flower', family: 'Balsaminaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'pansy', name: 'Pansy', emoji: '🌸', category: 'Flower', family: 'Violaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' },
      { id: 'violet', name: 'Violet', emoji: '🌸', category: 'Flower', family: 'Violaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '60-90 days' }
    ],

    // Leafy Greens
    leafyGreens: [
      { id: 'kale', name: 'Kale', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '50-65 days' },
      { id: 'arugula', name: 'Arugula', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '30-40 days' },
      { id: 'swiss-chard', name: 'Swiss Chard', emoji: '🥬', category: 'Leafy Green', family: 'Amaranthaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '50-60 days' },
      { id: 'collard-greens', name: 'Collard Greens', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '60-75 days' },
      { id: 'mustard-greens', name: 'Mustard Greens', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' },
      { id: 'bok-choy', name: 'Bok Choy', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '45-60 days' },
      { id: 'endive', name: 'Endive', emoji: '🥬', category: 'Leafy Green', family: 'Asteraceae', climate: 'Cool', difficulty: 'Medium', growthTime: '85-100 days' },
      { id: 'radicchio', name: 'Radicchio', emoji: '🥬', category: 'Leafy Green', family: 'Asteraceae', climate: 'Cool', difficulty: 'Medium', growthTime: '60-80 days' },
      { id: 'watercress', name: 'Watercress', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '30-50 days' },
      { id: 'mizuna', name: 'Mizuna', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' },
      { id: 'tatsoi', name: 'Tatsoi', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' },
      { id: 'komatsuna', name: 'Komatsuna', emoji: '🥬', category: 'Leafy Green', family: 'Brassicaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-50 days' },
      { id: 'mache', name: 'Mache', emoji: '🥬', category: 'Leafy Green', family: 'Valerianaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'purslane', name: 'Purslane', emoji: '🥬', category: 'Leafy Green', family: 'Portulacaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '30-40 days' },
      { id: 'amaranth', name: 'Amaranth', emoji: '🥬', category: 'Leafy Green', family: 'Amaranthaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '50-70 days' },
      { id: 'malabar-spinach', name: 'Malabar Spinach', emoji: '🥬', category: 'Leafy Green', family: 'Basellaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '60-80 days' },
      { id: 'new-zealand-spinach', name: 'New Zealand Spinach', emoji: '🥬', category: 'Leafy Green', family: 'Aizoaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '60-80 days' },
      { id: 'orach', name: 'Orach', emoji: '🥬', category: 'Leafy Green', family: 'Amaranthaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '40-60 days' },
      { id: 'miner\'s-lettuce', name: 'Miner\'s Lettuce', emoji: '🥬', category: 'Leafy Green', family: 'Montiaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '30-50 days' },
      { id: 'chickweed', name: 'Chickweed', emoji: '🥬', category: 'Leafy Green', family: 'Caryophyllaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '30-40 days' }
    ]
  },

  // Non-Flowering Plants
  nonFloweringPlants: {
    // Ferns
    ferns: [
      { id: 'maidenhair-fern', name: 'Maidenhair Fern', emoji: '🌿', category: 'Fern', family: 'Pteridaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'boston-fern', name: 'Boston Fern', emoji: '🌿', category: 'Fern', family: 'Nephrolepidaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'staghorn-fern', name: 'Staghorn Fern', emoji: '🌿', category: 'Fern', family: 'Polypodiaceae', climate: 'Warm', difficulty: 'Hard', growthTime: '2-3 years' },
      { id: 'bird\'s-nest-fern', name: 'Bird\'s Nest Fern', emoji: '🌿', category: 'Fern', family: 'Aspleniaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '1-2 years' },
      { id: 'leather-leaf-fern', name: 'Leather Leaf Fern', emoji: '🌿', category: 'Fern', family: 'Dryopteridaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '1-2 years' }
    ],

    // Mosses
    mosses: [
      { id: 'sphagnum-moss', name: 'Sphagnum Moss', emoji: '🌿', category: 'Moss', family: 'Sphagnaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '6-12 months' },
      { id: 'sheet-moss', name: 'Sheet Moss', emoji: '🌿', category: 'Moss', family: 'Hypnaceae', climate: 'Cool', difficulty: 'Easy', growthTime: '6-12 months' },
      { id: 'cushion-moss', name: 'Cushion Moss', emoji: '🌿', category: 'Moss', family: 'Leucobryaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '6-12 months' }
    ]
  },

  // Succulents and Cacti
  succulents: [
    { id: 'aloe-vera', name: 'Aloe Vera', emoji: '🌵', category: 'Succulent', family: 'Asphodelaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'jade-plant', name: 'Jade Plant', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'echeveria', name: 'Echeveria', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'sedum', name: 'Sedum', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'sempervivum', name: 'Sempervivum', emoji: '🌵', category: 'Succulent', family: 'Crassulaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '1-2 years' },
    { id: 'agave', name: 'Agave', emoji: '🌵', category: 'Succulent', family: 'Asparagaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '3-5 years' },
    { id: 'cactus', name: 'Cactus', emoji: '🌵', category: 'Cactus', family: 'Cactaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '1-3 years' }
  ],

  // Trees and Shrubs
  trees: [
    { id: 'oak', name: 'Oak Tree', emoji: '🌳', category: 'Tree', family: 'Fagaceae', climate: 'Temperate', difficulty: 'Hard', growthTime: '10-20 years' },
    { id: 'maple', name: 'Maple Tree', emoji: '🌳', category: 'Tree', family: 'Sapindaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '5-10 years' },
    { id: 'birch', name: 'Birch Tree', emoji: '🌳', category: 'Tree', family: 'Betulaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '5-10 years' },
    { id: 'willow', name: 'Willow Tree', emoji: '🌳', category: 'Tree', family: 'Salicaceae', climate: 'Temperate', difficulty: 'Easy', growthTime: '3-5 years' },
    { id: 'pine', name: 'Pine Tree', emoji: '🌲', category: 'Tree', family: 'Pinaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'spruce', name: 'Spruce Tree', emoji: '🌲', category: 'Tree', family: 'Pinaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'cedar', name: 'Cedar Tree', emoji: '🌲', category: 'Tree', family: 'Pinaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'cypress', name: 'Cypress Tree', emoji: '🌲', category: 'Tree', family: 'Cupressaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '10-20 years' },
    { id: 'palm', name: 'Palm Tree', emoji: '🌴', category: 'Tree', family: 'Arecaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '5-10 years' },
    { id: 'bamboo', name: 'Bamboo', emoji: '🎋', category: 'Tree', family: 'Poaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '2-5 years' }
  ],

  // Grasses and Grains
  grasses: [
    { id: 'wheat', name: 'Wheat', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Temperate', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'corn', name: 'Corn', emoji: '🌽', category: 'Grain', family: 'Poaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '60-100 days' },
    { id: 'rice', name: 'Rice', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '100-150 days' },
    { id: 'oats', name: 'Oats', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'barley', name: 'Barley', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'rye', name: 'Rye', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'sorghum', name: 'Sorghum', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Warm', difficulty: 'Medium', growthTime: '100-120 days' },
    { id: 'millet', name: 'Millet', emoji: '🌾', category: 'Grain', family: 'Poaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '60-90 days' },
    { id: 'quinoa', name: 'Quinoa', emoji: '🌾', category: 'Grain', family: 'Amaranthaceae', climate: 'Cool', difficulty: 'Medium', growthTime: '90-120 days' },
    { id: 'amaranth-grain', name: 'Amaranth Grain', emoji: '🌾', category: 'Grain', family: 'Amaranthaceae', climate: 'Warm', difficulty: 'Easy', growthTime: '90-120 days' }
  ]
};

// Helper function to get all plants
export const getAllPlants = () => {
  const allPlants = [];
  
  // Add flowering plants
  Object.values(plantDatabase.floweringPlants).forEach(category => {
    allPlants.push(...category);
  });
  
  // Add non-flowering plants
  Object.values(plantDatabase.nonFloweringPlants).forEach(category => {
    allPlants.push(...category);
  });
  
  // Add succulents
  allPlants.push(...plantDatabase.succulents);
  
  // Add trees
  allPlants.push(...plantDatabase.trees);
  
  // Add grasses
  allPlants.push(...plantDatabase.grasses);
  
  return allPlants;
};

// Helper function to get plants by category
export const getPlantsByCategory = (category) => {
  const allPlants = getAllPlants();
  return allPlants.filter(plant => plant.category === category);
};

// Helper function to get plants by climate
export const getPlantsByClimate = (climate) => {
  const allPlants = getAllPlants();
  return allPlants.filter(plant => plant.climate === climate);
};

// Helper function to get plants by family
export const getPlantsByFamily = (family) => {
  const allPlants = getAllPlants();
  return allPlants.filter(plant => plant.family === family);
};

// Helper function to search plants
export const searchPlants = (query) => {
  const allPlants = getAllPlants();
  const searchTerm = query.toLowerCase();
  
  return allPlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm) ||
    plant.category.toLowerCase().includes(searchTerm) ||
    plant.family.toLowerCase().includes(searchTerm) ||
    plant.climate.toLowerCase().includes(searchTerm)
  );
};

// Get unique categories
export const getCategories = () => {
  const allPlants = getAllPlants();
  return [...new Set(allPlants.map(plant => plant.category))];
};

// Get unique families
export const getFamilies = () => {
  const allPlants = getAllPlants();
  return [...new Set(allPlants.map(plant => plant.family))];
};

// Get unique climates
export const getClimates = () => {
  const allPlants = getAllPlants();
  return [...new Set(allPlants.map(plant => plant.climate))];
}; 