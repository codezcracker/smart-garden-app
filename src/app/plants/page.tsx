'use client';

import { useState, useEffect } from 'react';
import '../plants.css';

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

interface PlantData {
  plants: Plant[];
  pagination: {
    page: number;
    limit: number;
    totalPlants: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    families: string[];
    climates: string[];
    categories: string[];
  };
}

interface SearchInfo {
  searchTerm: string;
  resultsFound: number;
  totalInDatabase: number;
  hasSearchIndex: boolean;
  expandedTerms: string[];
}

export default function PlantsPage() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);

  // Fetch plants from the API
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '50',
          ...(searchTerm && { search: searchTerm })
        });

        const response = await fetch(`/api/plants-ultimate?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch plants: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setPlantData(data);
        setSearchInfo(data.searchInfo);
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plants');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [currentPage, searchTerm]);

  // Filter plants based on search term
  const filteredPlants = plantData?.plants || [];
  const totalPlants = plantData?.pagination?.totalPlants || 0;
  const healthyPlants = filteredPlants.filter(p => p.difficulty === 'Easy').length;
  const needAttentionPlants = filteredPlants.filter(p => p.difficulty === 'Hard').length;

  if (loading && !plantData) {
    return (
      <div className="plants-page-layout">
        <div className="main-content-area">
          <div className="plant-section">
            <div className="plant-header">
              <h1 className="plant-title">My Garden Collection</h1>
              <p className="plant-subtitle">Monitor and manage all your plants in one place.</p>
            </div>
            <div className="loading-state">
              <div className="loading-message">Loading your garden collection...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plants-page-layout">
        <div className="main-content-area">
          <div className="plant-section">
            <div className="plant-header">
              <h1 className="plant-title">My Garden Collection</h1>
              <p className="plant-subtitle">Monitor and manage all your plants in one place.</p>
            </div>
            <div className="error-state">
              <div className="error-message">Error: {error}</div>
              <button onClick={() => window.location.reload()} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="stat-number">{totalPlants.toLocaleString()}</div>
                <div className="stat-label">Total Plants</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number">{healthyPlants}</div>
                <div className="stat-label">Healthy</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number">{needAttentionPlants}</div>
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
                    <span className="plant-emoji">{plant.emoji}</span>
                  </div>
                  
                  <div className="plant-card-content">
                    <h3 className="plant-name">{plant.name}</h3>
                    <p className="plant-type">{plant.category}</p>
                    
                    <div className="plant-status-row">
                      <span className={`health-indicator health-${plant.difficulty.toLowerCase()}`}></span>
                      <span className="plant-status">{plant.difficulty}</span>
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

            {/* Pagination */}
            {plantData && plantData.pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!plantData.pagination.hasPrev}
                  className="pagination-button prev"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {plantData.pagination.page} of {plantData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!plantData.pagination.hasNext}
                  className="pagination-button next"
                >
                  Next
                </button>
              </div>
            )}
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
                  <p className="card-subtitle">{selectedPlant.category} • {selectedPlant.family}</p>
                </div>
                <div className="plant-detail-emoji">{selectedPlant.emoji}</div>
              </div>
              
              <div className="plant-conditions">
                <div className="condition-item">
                  <div className="condition-icon">🌡️</div>
                  <div className="condition-info">
                    <div className="condition-label">Climate</div>
                    <div className="condition-value">{selectedPlant.climate}</div>
                  </div>
                </div>
                
                <div className="condition-item">
                  <div className="condition-icon">⏳</div>
                  <div className="condition-info">
                    <div className="condition-label">Growth Time</div>
                    <div className="condition-value">{selectedPlant.growthTime}</div>
                  </div>
                </div>
                
                <div className="condition-item">
                  <div className="condition-icon">📊</div>
                  <div className="condition-info">
                    <div className="condition-label">Difficulty</div>
                    <div className="condition-value">{selectedPlant.difficulty}</div>
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
                  <span className="quick-stat-number">{totalPlants.toLocaleString()}</span>
                  <span className="quick-stat-label">Plants</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-number">{healthyPlants}</span>
                  <span className="quick-stat-label">Healthy</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-number">{new Set(filteredPlants.map(p => p.category)).size}</span>
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