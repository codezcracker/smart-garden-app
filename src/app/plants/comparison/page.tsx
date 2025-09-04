'use client';

import { useState, useEffect } from 'react';
import '../../plants.css';

interface Plant {
  id: string;
  scientificName: string;
  commonName: string;
  emoji: string;
  category: string;
  family: string;
  plantType?: string;
  climate?: string;
  difficulty?: string;
  growthTime?: string;
  matureHeight?: string;
  matureWidth?: string;
  wateringFrequency?: string;
  sunlightNeeds?: string;
  soilType?: string;
  bloomTime?: string;
  hardinessZone?: string;
  containerSuitable?: string;
  toxicity?: string;
  primaryUse?: string;
  maintenanceLevel?: string;
  careComplexity?: string;
  skillLevel?: string;
  rarityLevel?: string;
  commercialValue?: string;
  expectedYield?: string;
  seedCost?: string;
  maintenanceCost?: string;
  yieldValue?: string;
  marketDemand?: string;
  laborIntensity?: string;
  investmentReturn?: string;
  iotCompatibility?: string;
  automationComplexity?: string;
  monitoringFrequency?: string;
  smartWatering?: string;
  smartLighting?: string;
  roboticCompatibility?: string;
  aiRecommendations?: string;
  weatherIntegration?: string;
  cameraMonitoring?: string;
  voiceControlCompatible?: string;
  mobileAppFeatures?: string;
  communityFeatures?: string;
  dataLogging?: string;
  alertTypes?: string;
  sensorPriority?: string;
  sensorNeeds?: string;
  automationLevel?: string;
  idealTemperature?: string;
  propagationMethod?: string;
  leafType?: string;
  leafShape?: string;
  flowerColor?: string;
  flowerSize?: string;
  fruitType?: string;
  rootSystem?: string;
  foliageTexture?: string;
  barkType?: string;
  thorniness?: string;
  aromaMagnitude?: string;
  aromaType?: string;
  growthHabit?: string;
  waterAmount?: string;
  drainageNeeds?: string;
  humidityNeeds?: string;
  airCirculation?: string;
  fertilizer?: string;
  fertilizerType?: string;
  pHPreference?: string;
  mulchNeeds?: string;
  pruningFrequency?: string;
  pruningType?: string;
  winterCare?: string;
  pestSusceptibility?: string;
  diseaseSusceptibility?: string;
  minTemperature?: string;
  maxTemperature?: string;
  humidityRange?: string;
  windTolerance?: string;
  saltTolerance?: string;
  pollutionTolerance?: string;
  droughtTolerance?: string;
  floodTolerance?: string;
  heatStress?: string;
  coldHardiness?: string;
  plantingSeasonSpring?: string;
  plantingSeasonSummer?: string;
  plantingSeasonFall?: string;
  plantingSeasonWinter?: string;
  harvestSeason?: string;
  dormancyPeriod?: string;
  activeGrowthPeriod?: string;
  daylightSensitivity?: string;
  spacingDistance?: string;
  containerMinSize?: string;
  rootSpaceNeeds?: string;
  verticalSpace?: string;
  indoorSuitability?: string;
  outdoorRequirement?: string;
  landscapeUse?: string;
  companionPlants?: string;
  incompatiblePlants?: string;
  soilVolumeNeeds?: string;
  lightFootprint?: string;
  microclimateNeeds?: string;
  harvestDuration?: string;
  firstHarvestTime?: string;
  storageLife?: string;
  processingNeeds?: string;
  nutritionalValue?: string;
  edibleParts?: string;
  harvestMethod?: string;
  commonPests?: string;
  pestSeverity?: string;
  pestTreatment?: string;
  commonDiseases?: string;
  diseaseSeverity?: string;
  diseaseResistance?: string;
  fungalSusceptibility?: string;
  bacterialSusceptibility?: string;
  viralSusceptibility?: string;
  preventiveMeasures?: string;
  organicTreatments?: string;
  biologicalControls?: string;
  alternativeNames?: string;
  nativeRegion?: string;
  introducedRegions?: string;
  conservationStatus?: string;
  weedPotential?: string;
  allelopathic?: string;
  hybridParents?: string;
  cultivarGroup?: string;
}

interface ComparisonCategory {
  name: string;
  fields: string[];
  icon: string;
}

export default function PlantComparisonPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlants, setSelectedPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('basic');

  const comparisonCategories: ComparisonCategory[] = [
    {
      name: 'Basic Info',
      icon: '🌱',
      fields: ['scientificName', 'commonName', 'family', 'plantType', 'category', 'emoji']
    },
    {
      name: 'Growth & Care',
      icon: '🌿',
      fields: ['difficulty', 'growthTime', 'matureHeight', 'matureWidth', 'maintenanceLevel', 'careComplexity', 'skillLevel']
    },
    {
      name: 'Environmental',
      icon: '🌍',
      fields: ['climate', 'hardinessZone', 'idealTemperature', 'minTemperature', 'maxTemperature', 'humidityRange', 'windTolerance']
    },
    {
      name: 'Water & Soil',
      icon: '💧',
      fields: ['wateringFrequency', 'waterAmount', 'soilType', 'drainageNeeds', 'humidityNeeds', 'pHPreference', 'fertilizer']
    },
    {
      name: 'Physical Traits',
      icon: '🌸',
      fields: ['flowerColor', 'flowerSize', 'fruitType', 'leafType', 'leafShape', 'foliageTexture', 'barkType', 'thorniness']
    },
    {
      name: 'Smart Garden',
      icon: '🤖',
      fields: ['iotCompatibility', 'automationComplexity', 'sensorPriority', 'smartWatering', 'smartLighting', 'aiRecommendations', 'weatherIntegration']
    },
    {
      name: 'Economic',
      icon: '��',
      fields: ['seedCost', 'maintenanceCost', 'yieldValue', 'marketDemand', 'commercialValue', 'investmentReturn', 'laborIntensity']
    },
    {
      name: 'Health & Pests',
      icon: '🛡️',
      fields: ['pestSusceptibility', 'diseaseSusceptibility', 'commonPests', 'commonDiseases', 'preventiveMeasures', 'organicTreatments']
    }
  ];

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '50'
        });
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/plants-mongodb?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch plants');
        }
        
        const data = await response.json();
        
        if (data.success && data.plants) {
          // Deduplicate plants by ID to prevent React key conflicts
          const plants = data.plants || [];
          const deduplicatedPlants = plants.filter((plant: Plant, index: number, array: Plant[]) => 
            array.findIndex((p: Plant) => p.id === plant.id) === index
          );
          setPlants(deduplicatedPlants);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          throw new Error(data.error || 'Failed to load plants');
        }
        
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [currentPage, searchTerm]);

  const togglePlantSelection = (plant: Plant) => {
    setSelectedPlants(prev => {
      const isSelected = prev.some(p => p.id === plant.id);
      if (isSelected) {
        return prev.filter(p => p.id !== plant.id);
      } else {
        return [...prev, plant];
      }
    });
  };

  const removePlantFromComparison = (plantId: string) => {
    setSelectedPlants(prev => prev.filter(p => p.id !== plantId));
  };

  const clearComparison = () => {
    setSelectedPlants([]);
  };

  const getFieldValue = (plant: Plant, field: string): string => {
    const value = plant[field as keyof Plant];
    return value && value !== 'Not specified' ? value : 'N/A';
  };

  const getFieldDisplayName = (field: string): string => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const renderComparisonTable = () => {
    if (selectedPlants.length === 0) return null;

    const currentCategory = comparisonCategories.find(cat => cat.name.toLowerCase().replace(/\s+/g, '-') === activeCategory);
    if (!currentCategory) return null;

    return (
      <div className="comparison-table-container">
        <div className="comparison-header">
          <h2>{currentCategory.icon} {currentCategory.name} Comparison</h2>
          <button onClick={clearComparison} className="clear-comparison-btn">
            Clear All
          </button>
        </div>
        
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Field</th>
                {selectedPlants.map(plant => (
                  <th key={plant.id}>
                    <div className="plant-header">
                      <span className="plant-emoji">{plant.emoji}</span>
                      <span className="plant-name">{plant.commonName || plant.scientificName}</span>
                      <button 
                        onClick={() => removePlantFromComparison(plant.id)}
                        className="remove-plant-btn"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCategory.fields.map(field => (
                <tr key={field}>
                  <td className="field-name">{getFieldDisplayName(field)}</td>
                  {selectedPlants.map(plant => (
                    <td key={`${plant.id}-${field}`}>
                      {getFieldValue(plant, field)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="comparison-page">
      <div className="comparison-header-section">
        <h1>🔍 Plant Comparison Tool</h1>
        <p>Compare plants side-by-side across detailed fields</p>
      </div>

      <div className="comparison-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search plants to compare..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {selectedPlants.length > 0 && (
          <div className="selected-plants">
            <h3>Selected Plants ({selectedPlants.length})</h3>
            <div className="selected-plants-list">
              {selectedPlants.map(plant => (
                <div key={plant.id} className="selected-plant">
                  <span className="plant-emoji">{plant.emoji}</span>
                  <span className="plant-name">{plant.commonName || plant.scientificName}</span>
                  <button 
                    onClick={() => removePlantFromComparison(plant.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPlants.length > 0 && (
        <div className="category-tabs">
          {comparisonCategories.map(category => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name.toLowerCase().replace(/\s+/g, '-'))}
              className={`category-tab ${activeCategory === category.name.toLowerCase().replace(/\s+/g, '-') ? 'active' : ''}`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      )}

      {renderComparisonTable()}

      <div className="plants-selection">
        <h3>Select Plants to Compare</h3>
        
        {loading ? (
          <div className="loading-state">
            <p>Loading plants...</p>
          </div>
        ) : (
          <>
            <div className="plants-grid">
              {plants.map((plant, index) => (
                <div
                  key={`comparison-${plant.id}-${index}-${plant.scientificName || 'unknown'}`}
                  className={`plant-card ${selectedPlants.some(p => p.id === plant.id) ? 'selected' : ''}`}
                  onClick={() => togglePlantSelection(plant)}
                >
                  <div className="plant-card-header">
                    <span className="plant-emoji">{plant.emoji}</span>
                    <div className="selection-indicator">
                      {selectedPlants.some(p => p.id === plant.id) ? '✓' : '+'}
                    </div>
                  </div>
                  <div className="plant-card-content">
                    <h4 className="plant-name">{plant.commonName || plant.scientificName}</h4>
                    <p className="plant-family">{plant.family}</p>
                    <div className="plant-details">
                      <span className={`difficulty ${plant.difficulty?.toLowerCase() || 'medium'}`}>
                        {plant.difficulty || 'Medium'}
                      </span>
                      <span className="use-type">{plant.primaryUse}</span>
                    </div>
                    <div className="plant-stats">
                      <span>Growth: {plant.growthTime}</span>
                      <span>Maintenance: {plant.maintenanceLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
