'use client';

import { useState, useEffect } from 'react';
import './garden-designer.css';

export default function GardenPlannerWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [gardenData, setGardenData] = useState({
    area: { width: 10, height: 5, unit: 'meters' }, // Step 1
    layout: null, // Step 2
    sensors: [], // Step 3 - {position, deviceId, deviceName}
    plants: [] // Step 4 - {type, x, y, spacing}
  });
  
  const [availableDevices, setAvailableDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSensorPosition, setSelectedSensorPosition] = useState(null);
  const [selectedPlantCell, setSelectedPlantCell] = useState(null);
  const [showPlantSelector, setShowPlantSelector] = useState(false);
  const [plantSearchResults, setPlantSearchResults] = useState([]);
  const [plantSearchTerm, setPlantSearchTerm] = useState('');
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [plantSearchPage, setPlantSearchPage] = useState(1);

  // Fetch user's real devices
  useEffect(() => {
    fetchUserDevices();
  }, []);

  // Fetch plants from database when modal opens or search changes
  useEffect(() => {
    if (showPlantSelector) {
      fetchPlantsFromDatabase();
    }
  }, [showPlantSelector, plantSearchTerm, plantSearchPage]);

  const fetchUserDevices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('/api/iot/user-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableDevices(data.devices || []);
        console.log('✅ Loaded devices:', data.devices?.length);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlantsFromDatabase = async () => {
    setLoadingPlants(true);
    try {
      const params = new URLSearchParams({
        page: plantSearchPage.toString(),
        limit: '20'
      });
      
      if (plantSearchTerm) {
        params.append('search', plantSearchTerm);
      }
      
      const response = await fetch(`/api/plants-mongodb?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.plants) {
          setPlantSearchResults(data.plants);
          console.log(`🌱 Loaded ${data.plants.length} plants from database`);
        }
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoadingPlants(false);
    }
  };

  const layouts = [
    { 
      id: 'rectangular', 
      name: 'Rectangular', 
      icon: '▬',
      description: 'Classic rectangular garden bed',
      sensorPositions: [
        { id: 'start', name: 'Start', x: 15, y: 50 },
        { id: 'middle', name: 'Middle', x: 50, y: 50 },
        { id: 'end', name: 'End', x: 85, y: 50 }
      ]
    },
    { 
      id: 'square', 
      name: 'Square', 
      icon: '◼️',
      description: 'Compact square plot',
      sensorPositions: [
        { id: 'start', name: 'Start', x: 25, y: 25 },
        { id: 'middle', name: 'Middle', x: 50, y: 50 },
        { id: 'end', name: 'End', x: 75, y: 75 }
      ]
    },
    { 
      id: 'l-shaped', 
      name: 'L-Shaped', 
      icon: '┗',
      description: 'Corner garden',
      sensorPositions: [
        { id: 'start', name: 'Start', x: 20, y: 20 },
        { id: 'middle', name: 'Middle', x: 40, y: 60 },
        { id: 'end', name: 'End', x: 80, y: 65 }
      ]
    },
    { 
      id: 'circular', 
      name: 'Circular', 
      icon: '◯',
      description: 'Round garden bed',
      sensorPositions: [
        { id: 'start', name: 'Start', x: 25, y: 50 },
        { id: 'middle', name: 'Middle', x: 50, y: 50 },
        { id: 'end', name: 'End', x: 75, y: 50 }
      ]
    },
    { 
      id: 'long-narrow', 
      name: 'Long & Narrow', 
      icon: '➖',
      description: 'Pathway or border garden',
      sensorPositions: [
        { id: 'start', name: 'Start', x: 15, y: 50 },
        { id: 'middle', name: 'Middle', x: 50, y: 50 },
        { id: 'end', name: 'End', x: 85, y: 50 }
      ]
    }
  ];


  const assignDeviceToSensor = (position, device) => {
    const newSensors = [...gardenData.sensors];
    const existingIndex = newSensors.findIndex(s => s.position === position.id);
    
    if (existingIndex >= 0) {
      newSensors[existingIndex] = {
        position: position.id,
        positionName: position.name,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        x: position.x,
        y: position.y
      };
    } else {
      newSensors.push({
        position: position.id,
        positionName: position.name,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        x: position.x,
        y: position.y
      });
    }
    
    setGardenData({ ...gardenData, sensors: newSensors });
    setSelectedSensorPosition(null);
  };

  const addPlantToGarden = (plant) => {
    if (!selectedPlantCell) return;
    
    // Map database plant to garden plant format
    const newPlant = {
      id: Date.now(),
      name: plant.commonName || plant.scientificName,
      icon: getPlantIcon(plant.category || plant.family),
      x: selectedPlantCell.x,
      y: selectedPlantCell.y,
      cellId: selectedPlantCell.id,
      spacing: plant.spacing || 30,
      category: plant.category,
      scientificName: plant.scientificName,
      family: plant.family,
      waterNeeds: plant.wateringNeeds || plant.moisture || 'Medium',
      sunlight: plant.sunlightRequirements || plant.sunlight || 'Full Sun',
      climate: plant.climate
    };
    
    setGardenData({
      ...gardenData,
      plants: [...gardenData.plants, newPlant]
    });
    
    setShowPlantSelector(false);
    setSelectedPlantCell(null);
    setPlantSearchTerm(''); // Reset search
  };

  // Helper function to get emoji icon based on plant category
  const getPlantIcon = (category) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('vegetable') || categoryLower.includes('veggie')) return '🥬';
    if (categoryLower.includes('fruit')) return '🍎';
    if (categoryLower.includes('flower') || categoryLower.includes('flowering')) return '🌸';
    if (categoryLower.includes('herb')) return '🌿';
    if (categoryLower.includes('tree')) return '🌳';
    if (categoryLower.includes('grass') || categoryLower.includes('lawn')) return '🌾';
    if (categoryLower.includes('succulent') || categoryLower.includes('cactus')) return '🌵';
    if (categoryLower.includes('vine') || categoryLower.includes('climbing')) return '🍃';
    if (categoryLower.includes('shrub') || categoryLower.includes('bush')) return '🪴';
    return '🌱'; // Default
  };

  const generatePlantingGrid = () => {
    const layout = gardenData.layout;
    let cells = [];
    
    if (layout === 'rectangular' || layout === 'long-narrow') {
      // Grid of 6x4 cells
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          cells.push({
            id: `cell-${row}-${col}`,
            x: 15 + (col * 13),
            y: 20 + (row * 20),
            available: true
          });
        }
      }
    } else if (layout === 'square') {
      // Grid of 5x5 cells
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          cells.push({
            id: `cell-${row}-${col}`,
            x: 15 + (col * 14),
            y: 15 + (row * 14),
            available: true
          });
        }
      }
    } else if (layout === 'l-shaped') {
      // L-shaped grid - vertical part + horizontal part
      // Vertical part (left side)
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          cells.push({
            id: `cell-${row}-${col}`,
            x: 15 + (col * 13),
            y: 15 + (row * 13),
            available: true
          });
        }
      }
      // Horizontal part (bottom)
      for (let col = 3; col < 7; col++) {
        for (let row = 3; row < 5; row++) {
          cells.push({
            id: `cell-${row}-${col}`,
            x: 15 + (col * 13),
            y: 15 + (row * 13),
            available: true
          });
        }
      }
    } else if (layout === 'circular') {
      // Circular pattern - only cells within circle
      const centerX = 50;
      const centerY = 50;
      const radius = 35;
      
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          const x = 20 + (col * 12);
          const y = 20 + (row * 12);
          const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          
          if (dist <= radius) {
            cells.push({
              id: `cell-${row}-${col}`,
              x: x,
              y: y,
              available: true
            });
          }
        }
      }
    }
    
    return cells;
  };

  const handlePlantCellClick = (cell) => {
    const alreadyPlanted = gardenData.plants.find(p => p.cellId === cell.id);
    if (alreadyPlanted) {
      // Remove plant if already there
      removePlant(alreadyPlanted.id);
    } else {
      // Show plant selector
      setSelectedPlantCell(cell);
      setShowPlantSelector(true);
    }
  };

  const removePlant = (plantId) => {
    setGardenData({
      ...gardenData,
      plants: gardenData.plants.filter(p => p.id !== plantId)
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveFinalPlan = async () => {
    console.log('💾 Saving garden plan:', gardenData);
    
    // Export as JSON
    const planData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...gardenData
    };
    
    const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `garden-plan-${Date.now()}.json`;
    link.click();
    
    alert('✅ Garden plan saved successfully!');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return gardenData.area.width > 0 && gardenData.area.height > 0;
      case 2:
        return gardenData.layout !== null;
      case 3:
        return true; // Sensors are now optional
      case 4:
        return gardenData.plants.length > 0;
      default:
        return false;
    }
  };

  const selectedLayout = layouts.find(l => l.id === gardenData.layout);

  return (
    <div className="wizard-container">
      {/* Progress Bar */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Area'}
                {step === 2 && 'Layout'}
                {step === 3 && 'Sensors'}
                {step === 4 && 'Plants'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        {/* STEP 1: SELECT AREA */}
        {currentStep === 1 && (
          <div className="step-container">
            <div className="step-header">
              <h2>📏 Step 1: Define Your Garden Area</h2>
              <p>Set the dimensions of your garden space</p>
            </div>
            <div className="step-body">
              <div className="area-inputs">
                <div className="input-group">
                  <label>Width</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={gardenData.area.width}
                      onChange={(e) => setGardenData({
                        ...gardenData,
                        area: { ...gardenData.area, width: parseFloat(e.target.value) || 0 }
                      })}
                      min="1"
                      max="100"
                      step="0.5"
                    />
                    <span className="unit">meters</span>
                  </div>
                </div>
                <div className="multiply-symbol">×</div>
                <div className="input-group">
                  <label>Height</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={gardenData.area.height}
                      onChange={(e) => setGardenData({
                        ...gardenData,
                        area: { ...gardenData.area, height: parseFloat(e.target.value) || 0 }
                      })}
                      min="1"
                      max="100"
                      step="0.5"
                    />
                    <span className="unit">meters</span>
                  </div>
                </div>
              </div>
              <div className="area-preview">
                <div className="preview-label">Total Area</div>
                <div className="preview-value">
                  {(gardenData.area.width * gardenData.area.height).toFixed(1)} m²
                </div>
                <div className="preview-hint">
                  {gardenData.area.width * gardenData.area.height < 5 && '📍 Small garden - perfect for herbs and compact vegetables'}
                  {gardenData.area.width * gardenData.area.height >= 5 && gardenData.area.width * gardenData.area.height < 15 && '📍 Medium garden - great for variety of vegetables'}
                  {gardenData.area.width * gardenData.area.height >= 15 && '📍 Large garden - plenty of space for everything!'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT LAYOUT */}
        {currentStep === 2 && (
          <div className="step-container">
            <div className="step-header">
              <h2>🏗️ Step 2: Choose Garden Layout</h2>
              <p>Select the shape that fits your space</p>
            </div>
            <div className="step-body">
              <div className="layout-grid">
                {layouts.map(layout => (
                  <div
                    key={layout.id}
                    className={`layout-card ${gardenData.layout === layout.id ? 'selected' : ''}`}
                    onClick={() => setGardenData({ ...gardenData, layout: layout.id })}
                  >
                    <div className="layout-icon">{layout.icon}</div>
                    <h3>{layout.name}</h3>
                    <p>{layout.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ASSIGN SENSORS */}
        {currentStep === 3 && (
          <div className="step-container">
            <div className="step-header">
              <h2>📡 Step 3: Assign IoT Sensors (Optional)</h2>
              <p>Click on sensor positions and assign from your devices, or skip to continue</p>
            </div>
            <div className="step-body sensor-step">
              <div className="sensor-preview-panel">
                <div className="garden-visualization">
                  <div className={`garden-shape ${selectedLayout?.id || 'rectangular'}`}>
                    {selectedLayout?.sensorPositions.map(position => {
                      const assigned = gardenData.sensors.find(s => s.position === position.id);
                      return (
                        <div
                          key={position.id}
                          className={`sensor-position ${assigned ? 'assigned' : ''} ${selectedSensorPosition?.id === position.id ? 'selecting' : ''}`}
                          style={{ left: `${position.x}%`, top: `${position.y}%` }}
                          onClick={() => setSelectedSensorPosition(position)}
                        >
                          <div className="position-marker">
                            {assigned ? '✅' : '📡'}
                          </div>
                          <div className="position-label">
                            {assigned ? assigned.deviceName : position.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="sensor-status">
                  <div className="status-item">
                    <span className="status-icon">📡</span>
                    <span>Sensors Assigned: {gardenData.sensors.length}/3 (Optional)</span>
                  </div>
                  {gardenData.sensors.length === 0 && (
                    <div className="status-hint">
                      💡 You can skip this step and add sensors later
                    </div>
                  )}
                </div>
              </div>
              
              {selectedSensorPosition && (
                <div className="device-selection-panel">
                  <h3>Select Device for: {selectedSensorPosition.name}</h3>
                  {loading ? (
                    <div className="loading">Loading your devices...</div>
                  ) : availableDevices.length === 0 ? (
                    <div className="no-devices">
                      <p>❌ No devices found in your account</p>
                      <p>Please add devices in "My Devices" first</p>
                    </div>
                  ) : (
                    <div className="device-list">
                      {availableDevices.map(device => {
                        const alreadyAssigned = gardenData.sensors.find(s => s.deviceId === device.deviceId);
                        return (
                          <button
                            key={device.deviceId}
                            className={`device-card ${alreadyAssigned ? 'disabled' : ''}`}
                            onClick={() => !alreadyAssigned && assignDeviceToSensor(selectedSensorPosition, device)}
                            disabled={alreadyAssigned}
                          >
                            <div className="device-icon">
                              {device.status === 'online' ? '🟢' : '🔴'}
                            </div>
                            <div className="device-info">
                              <div className="device-name">{device.deviceName}</div>
                              <div className="device-id">{device.deviceId}</div>
                              {alreadyAssigned && <div className="device-status">Already assigned</div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button 
                    className="cancel-btn"
                    onClick={() => setSelectedSensorPosition(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: SELECT PLANTS */}
        {currentStep === 4 && (
          <div className="step-container">
            <div className="step-header">
              <h2>🌱 Step 4: Plant Your Garden</h2>
              <p>Click on highlighted cells to place plants</p>
            </div>
            <div className="step-body plants-step">
              <div className="plants-preview-panel full-width">
                <div className="garden-visualization-large">
                  <div className={`garden-shape-large ${selectedLayout?.id || 'rectangular'}`}>
                    {/* Show planting grid */}
                    {generatePlantingGrid().map(cell => {
                      const hasPlant = gardenData.plants.find(p => p.cellId === cell.id);
                      return (
                        <div
                          key={cell.id}
                          className={`plant-cell ${hasPlant ? 'has-plant' : 'empty'}`}
                          style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
                          onClick={() => handlePlantCellClick(cell)}
                          title={hasPlant ? `${hasPlant.name} - Click to remove` : 'Click to plant'}
                        >
                          {hasPlant ? (
                            <span className="plant-icon-large">{hasPlant.icon}</span>
                          ) : (
                            <span className="plant-placeholder">➕</span>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Show sensors */}
                    {gardenData.sensors.map(sensor => (
                      <div
                        key={sensor.position}
                        className="sensor-position-overlay"
                        style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
                      >
                        📡
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="plants-info-large">
                  <div className="info-header">
                    <h3>🎯 Garden Status</h3>
                  </div>
                  <div className="info-stats">
                    <div className="stat-box">
                      <div className="stat-value">{gardenData.plants.length}</div>
                      <div className="stat-label">Plants Added</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{gardenData.sensors.length}</div>
                      <div className="stat-label">Sensors</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{(gardenData.area.width * gardenData.area.height).toFixed(1)}m²</div>
                      <div className="stat-label">Total Area</div>
                    </div>
                  </div>
                  <div className="info-instructions">
                    <h4>📖 How to Plant:</h4>
                    <ul>
                      <li>✅ <strong>Click green highlighted cells</strong> to place plants</li>
                      <li>🗑️ <strong>Click planted cells</strong> to remove plants</li>
                      <li>💡 Green cells show optimal planting areas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plant Selector Modal */}
        {showPlantSelector && (
          <div className="modal-overlay" onClick={() => { setShowPlantSelector(false); setPlantSearchTerm(''); }}>
            <div className="plant-selector-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>🌱 Choose from 390,000+ Plants</h3>
                  <p className="modal-subtitle-header">Search our complete plant database</p>
                </div>
                <button className="modal-close" onClick={() => { setShowPlantSelector(false); setPlantSearchTerm(''); }}>×</button>
              </div>
              <div className="modal-body">
                {/* Search Bar */}
                <div className="plant-search-container">
                  <input
                    type="text"
                    className="plant-search-input"
                    placeholder="🔍 Search by plant name, category, or family..."
                    value={plantSearchTerm}
                    onChange={(e) => {
                      setPlantSearchTerm(e.target.value);
                      setPlantSearchPage(1);
                    }}
                    autoFocus
                  />
                </div>

                {/* Loading State */}
                {loadingPlants && (
                  <div className="loading-plants">
                    <div className="loader-spinner"></div>
                    <p>Searching database...</p>
                  </div>
                )}

                {/* Results */}
                {!loadingPlants && plantSearchResults.length > 0 && (
                  <>
                    <div className="results-count">
                      Found {plantSearchResults.length} plants {plantSearchTerm && `for "${plantSearchTerm}"`}
                    </div>
                    <div className="plant-selector-grid">
                      {plantSearchResults.map((plant, index) => (
                        <div 
                          key={plant._id || index} 
                          className="plant-option"
                          onClick={() => addPlantToGarden(plant)}
                        >
                          <div className="plant-option-icon">{getPlantIcon(plant.category || plant.family)}</div>
                          <div className="plant-option-name">{plant.commonName || plant.scientificName}</div>
                          {plant.scientificName && plant.commonName !== plant.scientificName && (
                            <div className="plant-option-scientific">{plant.scientificName}</div>
                          )}
                          <div className="plant-option-details">
                            <span>💧 {plant.wateringNeeds || plant.moisture || 'Medium'}</span>
                            <span>☀️ {(plant.sunlightRequirements || plant.sunlight || 'Full Sun').split(' ')[0]}</span>
                          </div>
                          {plant.category && (
                            <div className="plant-option-category">{plant.category}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="pagination-controls">
                      <button 
                        className="page-btn" 
                        onClick={() => setPlantSearchPage(Math.max(1, plantSearchPage - 1))}
                        disabled={plantSearchPage === 1}
                      >
                        ← Previous
                      </button>
                      <span className="page-indicator">Page {plantSearchPage}</span>
                      <button 
                        className="page-btn" 
                        onClick={() => setPlantSearchPage(plantSearchPage + 1)}
                        disabled={plantSearchResults.length < 20}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}

                {/* No Results */}
                {!loadingPlants && plantSearchResults.length === 0 && plantSearchTerm && (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h4>No plants found</h4>
                    <p>Try searching for something else or browse without a search term</p>
                  </div>
                )}

                {/* Initial State */}
                {!loadingPlants && plantSearchResults.length === 0 && !plantSearchTerm && (
                  <div className="search-prompt">
                    <div className="prompt-icon">🌿</div>
                    <h4>Start searching!</h4>
                    <p>Search from 390,000+ plants in our database</p>
                    <div className="search-suggestions">
                      <strong>Try searching for:</strong>
                      <div className="suggestion-chips">
                        <button className="suggestion-chip" onClick={() => setPlantSearchTerm('tomato')}>Tomato</button>
                        <button className="suggestion-chip" onClick={() => setPlantSearchTerm('rose')}>Rose</button>
                        <button className="suggestion-chip" onClick={() => setPlantSearchTerm('herb')}>Herbs</button>
                        <button className="suggestion-chip" onClick={() => setPlantSearchTerm('vegetable')}>Vegetables</button>
                        <button className="suggestion-chip" onClick={() => setPlantSearchTerm('flower')}>Flowers</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="wizard-navigation">
        <button 
          className="nav-btn prev" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          ← Previous
        </button>
        <div className="nav-info">
          Step {currentStep} of 4
        </div>
        {currentStep < 4 ? (
          <button 
            className="nav-btn next" 
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Next →
          </button>
        ) : (
          <button 
            className="nav-btn finish" 
            onClick={saveFinalPlan}
            disabled={!canProceed()}
          >
            💾 Save Garden Plan
          </button>
        )}
      </div>
    </div>
  );
}
