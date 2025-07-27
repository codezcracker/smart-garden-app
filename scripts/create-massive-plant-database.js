#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌱 Creating Massive Plant Database (2.5M+ plants)...\n');

// Plant families with their characteristics
const plantFamilies = [
  { name: 'Asteraceae', emoji: '🌼', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Poaceae', emoji: '🌾', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Fabaceae', emoji: '🫘', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Rosaceae', emoji: '🌹', climate: 'Temperate', difficulty: 'Medium', growthTime: '2 years' },
  { name: 'Lamiaceae', emoji: '🌿', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Solanaceae', emoji: '🍅', climate: 'Temperate', difficulty: 'Medium', growthTime: '1 year' },
  { name: 'Brassicaceae', emoji: '🥬', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Cucurbitaceae', emoji: '🥒', climate: 'Tropical', difficulty: 'Medium', growthTime: '1 year' },
  { name: 'Apiaceae', emoji: '🥕', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Alliaceae', emoji: '🧄', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Rutaceae', emoji: '🍋', climate: 'Tropical', difficulty: 'Medium', growthTime: '3 years' },
  { name: 'Malvaceae', emoji: '🌺', climate: 'Tropical', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Euphorbiaceae', emoji: '🌵', climate: 'Arid', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Orchidaceae', emoji: '🌸', climate: 'Tropical', difficulty: 'Hard', growthTime: '2 years' },
  { name: 'Pinaceae', emoji: '🌲', climate: 'Boreal', difficulty: 'Easy', growthTime: '5 years' },
  { name: 'Fagaceae', emoji: '🌳', climate: 'Temperate', difficulty: 'Medium', growthTime: '10 years' },
  { name: 'Betulaceae', emoji: '🌳', climate: 'Boreal', difficulty: 'Easy', growthTime: '5 years' },
  { name: 'Salicaceae', emoji: '🌳', climate: 'Temperate', difficulty: 'Easy', growthTime: '3 years' },
  { name: 'Ulmaceae', emoji: '🌳', climate: 'Temperate', difficulty: 'Medium', growthTime: '8 years' },
  { name: 'Juglandaceae', emoji: '🌰', climate: 'Temperate', difficulty: 'Medium', growthTime: '7 years' },
  { name: 'Anacardiaceae', emoji: '🥭', climate: 'Tropical', difficulty: 'Medium', growthTime: '4 years' },
  { name: 'Sapindaceae', emoji: '🍁', climate: 'Temperate', difficulty: 'Medium', growthTime: '6 years' },
  { name: 'Oleaceae', emoji: '🫒', climate: 'Mediterranean', difficulty: 'Medium', growthTime: '5 years' },
  { name: 'Caprifoliaceae', emoji: '🌸', climate: 'Temperate', difficulty: 'Easy', growthTime: '2 years' },
  { name: 'Ericaceae', emoji: '🫐', climate: 'Boreal', difficulty: 'Medium', growthTime: '3 years' },
  { name: 'Grossulariaceae', emoji: '🫐', climate: 'Temperate', difficulty: 'Medium', growthTime: '2 years' },
  { name: 'Vitaceae', emoji: '🍇', climate: 'Temperate', difficulty: 'Medium', growthTime: '3 years' },
  { name: 'Actinidiaceae', emoji: '🥝', climate: 'Temperate', difficulty: 'Medium', growthTime: '3 years' },
  { name: 'Myrtaceae', emoji: '🫐', climate: 'Tropical', difficulty: 'Medium', growthTime: '4 years' },
  { name: 'Lauraceae', emoji: '🌿', climate: 'Tropical', difficulty: 'Medium', growthTime: '5 years' },
  { name: 'Zingiberaceae', emoji: '🫚', climate: 'Tropical', difficulty: 'Medium', growthTime: '2 years' },
  { name: 'Arecaceae', emoji: '🌴', climate: 'Tropical', difficulty: 'Medium', growthTime: '8 years' },
  { name: 'Bromeliaceae', emoji: '🍍', climate: 'Tropical', difficulty: 'Easy', growthTime: '2 years' },
  { name: 'Musaceae', emoji: '🍌', climate: 'Tropical', difficulty: 'Medium', growthTime: '2 years' },
  { name: 'Heliconiaceae', emoji: '🌺', climate: 'Tropical', difficulty: 'Medium', growthTime: '2 years' },
  { name: 'Strelitziaceae', emoji: '🌺', climate: 'Tropical', difficulty: 'Medium', growthTime: '3 years' },
  { name: 'Cannaceae', emoji: '🌺', climate: 'Tropical', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Marantaceae', emoji: '🌿', climate: 'Tropical', difficulty: 'Easy', growthTime: '1 year' },
  { name: 'Zamiaceae', emoji: '🌿', climate: 'Tropical', difficulty: 'Hard', growthTime: '10 years' },
  { name: 'Cycadaceae', emoji: '🌿', climate: 'Tropical', difficulty: 'Hard', growthTime: '15 years' },
  { name: 'Ginkgoaceae', emoji: '🌳', climate: 'Temperate', difficulty: 'Medium', growthTime: '20 years' },
  { name: 'Taxaceae', emoji: '🌲', climate: 'Boreal', difficulty: 'Medium', growthTime: '15 years' },
  { name: 'Cupressaceae', emoji: '🌲', climate: 'Boreal', difficulty: 'Easy', growthTime: '8 years' },
  { name: 'Araucariaceae', emoji: '🌲', climate: 'Tropical', difficulty: 'Medium', growthTime: '12 years' },
  { name: 'Podocarpaceae', emoji: '🌲', climate: 'Tropical', difficulty: 'Medium', growthTime: '10 years' },
  { name: 'Cephalotaxaceae', emoji: '🌲', climate: 'Temperate', difficulty: 'Medium', growthTime: '12 years' },
  { name: 'Sciadopityaceae', emoji: '🌲', climate: 'Temperate', difficulty: 'Medium', growthTime: '15 years' },
  { name: 'Taxodiaceae', emoji: '🌲', climate: 'Temperate', difficulty: 'Medium', growthTime: '10 years' },
  { name: 'Welwitschiaceae', emoji: '🌿', climate: 'Arid', difficulty: 'Hard', growthTime: '20 years' },
  { name: 'Ephedraceae', emoji: '🌿', climate: 'Arid', difficulty: 'Medium', growthTime: '5 years' },
  { name: 'Gnetaceae', emoji: '🌿', climate: 'Tropical', difficulty: 'Hard', growthTime: '15 years' },
  { name: 'Unknown', emoji: '🪴', climate: 'Temperate', difficulty: 'Easy', growthTime: '1 year' }
];

// Common plant genera and species patterns
const plantGenera = [
  'Abutilon', 'Acacia', 'Acer', 'Achillea', 'Aconitum', 'Adiantum', 'Aesculus', 'Agave', 'Ageratum', 'Agrostis',
  'Allium', 'Alnus', 'Aloe', 'Amaranthus', 'Ambrosia', 'Amelanchier', 'Anemone', 'Angelica', 'Anthemis', 'Anthoxanthum',
  'Aralia', 'Arctium', 'Arctostaphylos', 'Arenaria', 'Artemisia', 'Asarum', 'Asclepias', 'Asparagus', 'Aster', 'Astragalus',
  'Atriplex', 'Avena', 'Baptisia', 'Berberis', 'Betula', 'Bidens', 'Blephilia', 'Bouteloua', 'Bromus', 'Calamagrostis',
  'Calystegia', 'Campanula', 'Capsella', 'Cardamine', 'Carex', 'Carya', 'Castanea', 'Ceanothus', 'Celtis', 'Centaurea',
  'Cercis', 'Chamaecrista', 'Chamerion', 'Chasmanthium', 'Chelone', 'Chimaphila', 'Chrysanthemum', 'Cichorium', 'Cirsium', 'Claytonia',
  'Clematis', 'Clinopodium', 'Collinsonia', 'Comandra', 'Commelina', 'Conoclinium', 'Conopholis', 'Conyza', 'Coreopsis', 'Cornus',
  'Corydalis', 'Crataegus', 'Cuscuta', 'Cynoglossum', 'Cypripedium', 'Dactylis', 'Dalea', 'Danthonia', 'Daucus', 'Delphinium',
  'Desmodium', 'Dichanthelium', 'Dicentra', 'Diervilla', 'Digitaria', 'Dioscorea', 'Dodecatheon', 'Draba', 'Drosera', 'Dryopteris',
  'Echinacea', 'Echinochloa', 'Elymus', 'Epigaea', 'Epilobium', 'Equisetum', 'Eragrostis', 'Erigeron', 'Eriogonum', 'Eryngium',
  'Erythronium', 'Eupatorium', 'Euphorbia', 'Euthamia', 'Fagus', 'Festuca', 'Fragaria', 'Fraxinus', 'Galium', 'Gaultheria',
  'Gentiana', 'Geranium', 'Geum', 'Glyceria', 'Goodyera', 'Hackelia', 'Hamamelis', 'Helenium', 'Helianthus', 'Heliopsis',
  'Hepatica', 'Heracleum', 'Hesperis', 'Hieracium', 'Houstonia', 'Humulus', 'Hypericum', 'Hypoxis', 'Ilex', 'Impatiens',
  'Iris', 'Juglans', 'Juncus', 'Juniperus', 'Kalmia', 'Lactuca', 'Lathyrus', 'Leersia', 'Lespedeza', 'Liatris',
  'Lilium', 'Lindera', 'Linum', 'Liriodendron', 'Lobelia', 'Lonicera', 'Ludwigia', 'Lupinus', 'Lycopodium', 'Lysimachia',
  'Lythrum', 'Maianthemum', 'Malus', 'Mentha', 'Mimulus', 'Mitchella', 'Monarda', 'Morus', 'Muhlenbergia', 'Myosotis',
  'Nepeta', 'Nuphar', 'Nymphaea', 'Oenothera', 'Onoclea', 'Ophioglossum', 'Osmorhiza', 'Osmunda', 'Oxalis', 'Oxydendrum',
  'Panicum', 'Parthenocissus', 'Pedicularis', 'Penstemon', 'Persicaria', 'Phalaris', 'Phlox', 'Physalis', 'Picea', 'Pinus',
  'Plantago', 'Platanus', 'Poa', 'Podophyllum', 'Polygonatum', 'Polygonum', 'Polystichum', 'Populus', 'Potentilla', 'Prunus',
  'Pteridium', 'Pteris', 'Pulsatilla', 'Pyrola', 'Quercus', 'Ranunculus', 'Rhamnus', 'Rhododendron', 'Rhus', 'Ribes',
  'Robinia', 'Rosa', 'Rubus', 'Rudbeckia', 'Rumex', 'Sagittaria', 'Salix', 'Sambucus', 'Sanguinaria', 'Sanicula',
  'Sassafras', 'Saxifraga', 'Scirpus', 'Scutellaria', 'Sedum', 'Senecio', 'Setaria', 'Silene', 'Sisyrinchium', 'Smilax',
  'Solidago', 'Sorbus', 'Sorghastrum', 'Sparganium', 'Spiranthes', 'Sporobolus', 'Stachys', 'Stellaria', 'Symphyotrichum', 'Symplocarpus',
  'Taraxacum', 'Taxodium', 'Taxus', 'Thalictrum', 'Thelypteris', 'Tilia', 'Toxicodendron', 'Tradescantia', 'Trifolium', 'Tsuga',
  'Typha', 'Ulmus', 'Uvularia', 'Vaccinium', 'Verbascum', 'Verbena', 'Vernonia', 'Veronica', 'Viburnum', 'Vicia',
  'Viola', 'Vitis', 'Woodsia', 'Woodwardia', 'Xanthium', 'Yucca', 'Zanthoxylum', 'Zea', 'Zizia', 'Zizania'
];

// Species epithets
const speciesEpithets = [
  'alba', 'albicans', 'americana', 'angustifolia', 'annua', 'aquatica', 'arborescens', 'argentea', 'aspera', 'atropurpurea',
  'aurea', 'barbata', 'bicolor', 'borealis', 'brevifolia', 'californica', 'canadensis', 'capillaris', 'caroliniana', 'cernua',
  'chinensis', 'ciliata', 'cinerea', 'communis', 'cordata', 'corymbosa', 'crispa', 'cristata', 'curvata', 'decumbens',
  'densa', 'diffusa', 'digitata', 'divaricata', 'dulcis', 'echinata', 'edulis', 'elegans', 'elliptica', 'erecta',
  'fasciculata', 'filiformis', 'flava', 'flexuosa', 'floribunda', 'fragilis', 'fruticosa', 'glauca', 'glomerata', 'gracilis',
  'grandiflora', 'hirsuta', 'humilis', 'incana', 'indica', 'japonica', 'laevis', 'lanata', 'lanceolata', 'latifolia',
  'leucantha', 'linearis', 'longifolia', 'lutea', 'maculata', 'majus', 'maritima', 'mollis', 'montana', 'multiflora',
  'nana', 'nigra', 'nivea', 'nuttallii', 'obtusa', 'occidentalis', 'odorata', 'officinalis', 'ovata', 'palustris',
  'paniculata', 'parviflora', 'patens', 'pensylvanica', 'perennis', 'pilosa', 'pinnata', 'platyphylla', 'pubescens', 'purpurea',
  'quadrifolia', 'quinquefolia', 'racemosa', 'radicans', 'repens', 'reptans', 'rigida', 'rotundifolia', 'rubra', 'rugosa',
  'sagittata', 'salicifolia', 'sativa', 'scabra', 'scandens', 'sericea', 'serotina', 'sessilis', 'setosa', 'simplex',
  'sinuata', 'spicata', 'spicatum', 'spinosum', 'stellata', 'stricta', 'subulata', 'sylvatica', 'tenuifolia', 'tomentosa',
  'trifoliata', 'triloba', 'umbellata', 'uniflora', 'velutina', 'verna', 'verticillata', 'villosa', 'virginiana', 'vulgaris'
];

// Categories
const categories = ['Species', 'Subspecies', 'Variety', 'Cultivar', 'Hybrid'];

// Additional descriptive terms
const descriptiveTerms = [
  'var.', 'subsp.', 'f.', 'cv.', '×', 'ssp.', 'cultivar', 'hybrid', 'nothosubsp.', 'nothovar.'
];

function generatePlantName() {
  const genus = plantGenera[Math.floor(Math.random() * plantGenera.length)];
  const epithet = speciesEpithets[Math.floor(Math.random() * speciesEpithets.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  let name = `${genus} ${epithet}`;
  
  // Add variety/subspecies occasionally
  if (Math.random() < 0.3) {
    const term = descriptiveTerms[Math.floor(Math.random() * descriptiveTerms.length)];
    const additionalEpithet = speciesEpithets[Math.floor(Math.random() * speciesEpithets.length)];
    name += ` ${term} ${additionalEpithet}`;
  }
  
  // Add author occasionally
  if (Math.random() < 0.4) {
    const authors = ['L.', 'Mill.', 'Pursh', 'Nutt.', 'Torr.', 'Gray', 'Britton', 'Small', 'Fernald', 'Gleason'];
    const author = authors[Math.floor(Math.random() * authors.length)];
    name += ` ${author}`;
  }
  
  return name;
}

function createPlantDatabase() {
  const plants = [];
  const totalPlants = 2500000; // 2.5 million plants
  
  console.log(`Generating ${totalPlants.toLocaleString()} plants...`);
  
  for (let i = 0; i < totalPlants; i++) {
    if (i % 100000 === 0) {
      console.log(`Progress: ${(i / totalPlants * 100).toFixed(1)}% (${i.toLocaleString()} plants)`);
    }
    
    const family = plantFamilies[Math.floor(Math.random() * plantFamilies.length)];
    const name = generatePlantName();
    
    // Special handling for Capsicum species (chili peppers)
    let emoji = family.emoji;
    if (name.includes('Capsicum')) {
      emoji = '🌶️';
    }
    
    const plant = {
      id: i,
      name: name,
      emoji: emoji,
      category: family.name === 'Unknown' ? 'Species' : categories[Math.floor(Math.random() * categories.length)],
      family: family.name,
      climate: family.climate,
      difficulty: family.difficulty,
      growthTime: family.growthTime
    };
    
    plants.push(plant);
  }
  
  return plants;
}

function saveToCSV(plants, filename) {
  console.log('\n📝 Saving to CSV...');
  
  const headers = ['id,name,emoji,category,family,climate,difficulty,growthTime'];
  const csvLines = [headers.join(',')];
  
  for (const plant of plants) {
    const line = [
      plant.id,
      `"${plant.name}"`,
      plant.emoji,
      `"${plant.category}"`,
      `"${plant.family}"`,
      `"${plant.climate}"`,
      `"${plant.difficulty}"`,
      `"${plant.growthTime}"`
    ].join(',');
    csvLines.push(line);
  }
  
  const csvContent = csvLines.join('\n');
  fs.writeFileSync(filename, csvContent, 'utf-8');
  
  console.log(`✅ Saved ${plants.length.toLocaleString()} plants to ${filename}`);
  console.log(`📊 File size: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
}

async function main() {
  const startTime = Date.now();
  
  try {
    // Create the massive plant database
    const plants = createPlantDatabase();
    
    // Save to CSV
    const outputFile = path.join(process.cwd(), 'data', 'plant-database.csv');
    saveToCSV(plants, outputFile);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 Database creation complete!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log(`📁 Output file: ${outputFile}`);
    console.log(`🌱 Total plants: ${plants.length.toLocaleString()}`);
    console.log(`💾 File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create a sample file for testing
    const samplePlants = plants.slice(0, 100);
    const sampleFile = path.join(process.cwd(), 'data', 'plant-database-sample.csv');
    saveToCSV(samplePlants, sampleFile);
    console.log(`\n📋 Sample file created: ${sampleFile} (100 plants)`);
    
  } catch (error) {
    console.error('❌ Error creating database:', error);
    process.exit(1);
  }
}

main(); 