'use client';

import { useState } from 'react';
import '../plants.css';

export default function PlantsPage() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const plants = [
    {
      id: 1,
      name: 'Bird of Paradise',
      type: 'Tropical',
      health: 'Excellent',
      lastWatered: '2 hours ago',
      image: '🌿',
      status: 'Growing well',
      temperature: '22°C',
      humidity: '65%',
      light: 'Bright indirect'
    },
    {
      id: 2,
      name: 'Monstera Deliciosa',
      type: 'Tropical',
      health: 'Good',
      lastWatered: '1 day ago',
      image: '🌱',
      status: 'Needs attention',
      temperature: '21°C',
      humidity: '70%',
      light: 'Medium'
    },
    {
      id: 3,
      name: 'Snake Plant',
      type: 'Succulent',
      health: 'Excellent',
      lastWatered: '3 days ago',
      image: '🌵',
      status: 'Thriving',
      temperature: '20°C',
      humidity: '45%',
      light: 'Low'
    },
    {
      id: 4,
      name: 'Peace Lily',
      type: 'Flowering',
      health: 'Good',
      lastWatered: '1 day ago',
      image: '🌸',
      status: 'Blooming',
      temperature: '23°C',
      humidity: '75%',
      light: 'Bright indirect'
    },
    {
      id: 5,
      name: 'ZZ Plant',
      type: 'Tropical',
      health: 'Excellent',
      lastWatered: '5 days ago',
      image: '🌿',
      status: 'Low maintenance',
      temperature: '21°C',
      humidity: '50%',
      light: 'Low to medium'
    },
    {
      id: 6,
      name: 'Pothos',
      type: 'Vining',
      health: 'Good',
      lastWatered: '2 days ago',
      image: '🌱',
      status: 'Growing fast',
      temperature: '22°C',
      humidity: '60%',
      light: 'Medium'
    }
  ];

  // Filter plants based on search term
  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="plants-page-layout">
      {/* Main Content Area */}
      <div className="main-content-area">
        <div className="plant-section">
          {/* 1. Header Section */}
          <div className="plant-header">
            <h1 className="plant-title">My Garden Collection</h1>
            <p className="plant-subtitle">Monitor and manage all your plants in one place.</p>
          </div>
          
          {/* 2. Search Bar Section */}
          <div className="search-section">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search plants..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* 3. Plants Overview Section */}
          <div className="plants-overview">
            {/* Statistics */}
            <div className="plants-stats">
              <div className="stat-card">
                <div className="stat-number">{filteredPlants.length}</div>
                <div className="stat-label">Total Plants</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number">{filteredPlants.filter(p => p.health === 'Excellent').length}</div>
                <div className="stat-label">Healthy</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number">{filteredPlants.filter(p => p.status.includes('attention')).length}</div>
                <div className="stat-label">Need Attention</div>
              </div>
            </div>
            
            {/* Plants Grid */}
            <div className="plants-grid-modern">
              {filteredPlants.map((plant) => (
                <div 
                  key={plant.id} 
                  className={`modern-plant-card ${selectedPlant?.id === plant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlant(plant)}
                >
                  <div className="plant-card-image">
                    <span className="plant-emoji">{plant.image}</span>
                  </div>
                  
                  <div className="plant-card-content">
                    <h3 className="plant-name">{plant.name}</h3>
                    <p className="plant-type">{plant.type}</p>
                    
                    <div className="plant-status-row">
                      <span className={`health-indicator health-${plant.health.toLowerCase()}`}></span>
                      <span className="plant-status">{plant.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Plant Card */}
              <div className="modern-plant-card add-plant">
                <div className="add-plant-content">
                  <div className="add-plant-icon">
                    <span>+</span>
                  </div>
                  <h3 className="add-plant-title">Add Plant</h3>
                  <p className="add-plant-subtitle">Monitor a new plant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Plant Details */}
      <div className="right-sidebar">
        {selectedPlant ? (
          <>
            {/* Selected Plant Details */}
            <div className="sidebar-card plant-detail-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{selectedPlant.name}</h3>
                  <p className="card-subtitle">{selectedPlant.type} • Last watered {selectedPlant.lastWatered}</p>
                </div>
                <div className="plant-detail-emoji">{selectedPlant.image}</div>
              </div>
              
              <div className="plant-conditions">
                <div className="condition-item">
                  <div className="condition-icon">🌡️</div>
                  <div className="condition-info">
                    <div className="condition-label">Temperature</div>
                    <div className="condition-value">{selectedPlant.temperature}</div>
                  </div>
                </div>
                
                <div className="condition-item">
                  <div className="condition-icon">💧</div>
                  <div className="condition-info">
                    <div className="condition-label">Humidity</div>
                    <div className="condition-value">{selectedPlant.humidity}</div>
                  </div>
                </div>
                
                <div className="condition-item">
                  <div className="condition-icon">☀️</div>
                  <div className="condition-info">
                    <div className="condition-label">Light</div>
                    <div className="condition-value">{selectedPlant.light}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Care Actions */}
            <div className="sidebar-card care-actions-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Care Actions</h3>
                  <p className="card-subtitle">Quick plant care options</p>
                </div>
              </div>
              
              <div className="care-actions">
                <button className="care-action-btn primary">
                  💧 Water Now
                </button>
                <button className="care-action-btn secondary">
                  ✂️ Pruning Due
                </button>
                <button className="care-action-btn secondary">
                  🌱 Add Fertilizer
                </button>
              </div>
            </div>

            {/* Health Insights */}
            <div className="sidebar-card health-insights-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Health Insights</h3>
                  <p className="card-subtitle">AI-powered recommendations</p>
                </div>
              </div>
              
              <div className="health-insights">
                <div className="insight-item">
                  <div className="insight-icon">💡</div>
                  <div className="insight-text">
                    <strong>Tip:</strong> Consider moving to brighter location for optimal growth.
                  </div>
                </div>
                
                <div className="insight-item">
                  <div className="insight-icon">📅</div>
                  <div className="insight-text">
                    <strong>Schedule:</strong> Next watering recommended in 2 days.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Default Right Sidebar Content */
          <div className="sidebar-card welcome-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Plant Overview</h3>
                <p className="card-subtitle">Select a plant to view details</p>
              </div>
            </div>
            
            <div className="welcome-content">
              <div className="welcome-icon">🌿</div>
              <h4 className="welcome-title">Garden Dashboard</h4>
              <p className="welcome-text">
                Click on any plant card to view detailed information, care recommendations, and health insights.
              </p>
              
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="quick-stat-number">{filteredPlants.length}</span>
                  <span className="quick-stat-label">Plants</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-number">{filteredPlants.filter(p => p.health === 'Excellent').length}</span>
                  <span className="quick-stat-label">Healthy</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-number">{new Set(filteredPlants.map(p => p.type)).size}</span>
                  <span className="quick-stat-label">Types</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 