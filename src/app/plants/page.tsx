'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import './plants.css';

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
  wateringFrequency?: string;
  sunlightNeeds?: string;
  matureHeight?: string;
  soilType?: string;
  primaryUse?: string;
}

export default function PlantsPage() {
  const [plantData, setPlantData] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [totalPlants, setTotalPlants] = useState(0);
  const [responseTime, setResponseTime] = useState<string>('');
  const [searchMessages] = useState<string[]>([
    'Searching through 390,000+ plants...',
    'Analyzing plant characteristics...',
    'Finding the perfect matches...',
    'Almost there...'
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Ref to maintain focus on search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSearchingRef = useRef(false);

  // Debounce search term to prevent focus loss - only search if 3+ characters
  useEffect(() => {
    if (searchTerm) {
      setIsTyping(true);
    }
    
    const timer = setTimeout(() => {
      // Only trigger search if search term has 3+ characters or is empty (show all)
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
      setIsTyping(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch plants when debounced search term or page changes
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        isSearchingRef.current = true;
        
        // Set different loading states based on whether it's a search or initial load
        if (debouncedSearchTerm) {
          setSearchLoading(true);
          setCurrentMessageIndex(0);
        } else {
          setLoading(true);
        }
        setError(null);
        
        // Use MongoDB API
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12'
        });
        
        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }
        
        
        const response = await fetch(`/api/plants-mongodb?${params}`);
        
        
        if (!response.ok) {
          throw new Error('Failed to fetch plants from MongoDB');
        }
        
        const data = await response.json();
        
        if (data.success && data.plants) {
          setPlantData(data.plants);
          setTotalPages(data.pagination.totalPages);
          setTotalPlants(data.pagination.total);
          setResponseTime(data.performance.responseTime);
          console.log('🌱 Plants loaded from MongoDB:', data.metadata);
        } else {
          throw new Error(data.error || 'Failed to load plants');
        }
        
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setSearchLoading(false);
        isSearchingRef.current = false;
        
        // Restore focus to search input after search completes
        if (searchInputRef.current && searchTerm) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
              // Ensure cursor is at the end
              const length = searchInputRef.current.value.length;
              searchInputRef.current.setSelectionRange(length, length);
            }
          });
        }
      }
    };

    fetchPlants();
  }, [currentPage, debouncedSearchTerm, searchTerm]);

  // Cycle through search messages while loading
  useEffect(() => {
    if (searchLoading) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % searchMessages.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [searchLoading, searchMessages.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // The search will trigger automatically via debouncedSearchTerm
  };

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSearchInputFocus = useCallback(() => {
    // Ensure input stays focused
    if (searchInputRef.current && !isSearchingRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handlePlantClick = (plant: Plant) => {
    setSelectedPlant(plant);
  };

  const closeModal = () => {
    setSelectedPlant(null);
  };

  // Get search status message
  const getSearchStatusMessage = () => {
    if (searchLoading) return searchMessages[currentMessageIndex];
    if (isTyping && searchTerm.length < 3) return `Type ${3 - searchTerm.length} more character${3 - searchTerm.length === 1 ? '' : 's'} to search...`;
    if (isTyping) return 'Type to search... (waiting for you to finish)';
    if (searchTerm.length > 0 && searchTerm.length < 3) return `Type ${3 - searchTerm.length} more character${3 - searchTerm.length === 1 ? '' : 's'} to search...`;
    return '';
  };

  return (
    <div className="plants-container">
      <div className="plants-header">
        <h1>🌱 Smart Garden Plants</h1>
        <p>Discover and manage your plant collection with MongoDB Atlas</p>
        
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchLoading ? "Searching..." : "Search plants by name, category, or family... (min 3 characters)"}
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={handleSearchInputFocus}
                className={`search-input ${isTyping ? 'typing' : ''} ${searchTerm.length > 0 && searchTerm.length < 3 ? 'insufficient' : ''}`}
                disabled={searchLoading}
                style={searchLoading ? { 
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  cursor: 'not-allowed'
                } : {}}
                autoComplete="off"
                autoFocus
              />
              <button type="submit" className="search-button" disabled={searchLoading || searchTerm.length < 3}>
                {searchLoading ? '⏳' : '🔍'} {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          
          {/* Search Status Indicators */}
          {getSearchStatusMessage() && (
            <div className={`search-status ${isTyping ? 'typing' : searchLoading ? 'searching' : ''}`}>
              <div className="search-status-dot"></div>
              <span>{getSearchStatusMessage()}</span>
            </div>
          )}
          
          {searchLoading && (
            <div className="search-loading">
              <div className="search-spinner"></div>
              <span>{searchMessages[currentMessageIndex]}</span>
            </div>
          )}
        </div>
        
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total Plants:</span>
            <span className="stat-value">{totalPlants.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Response Time:</span>
            <span className="stat-value">{responseTime}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Database:</span>
            <span className="stat-value">MongoDB Atlas</span>
          </div>
        </div>
      </div>

      {loading && !searchLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading plants from MongoDB Atlas...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            🔄 Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="plants-grid" style={{ position: 'relative' }}>
            {/* Search Loading Overlay */}
            {searchLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: '16px',
                minHeight: '400px'
              }}>
                <div className="spinner"></div>
                <p style={{ 
                  fontSize: '1.125rem', 
                  color: '#047857', 
                  fontWeight: '500', 
                  margin: '1rem 0 0 0',
                  textAlign: 'center'
                }}>
                  {searchMessages[currentMessageIndex]}
                </p>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  margin: '0.5rem 0 0 0',
                  textAlign: 'center'
                }}>
                  Found {totalPlants.toLocaleString()} results so far...
                </p>
              </div>
            )}
            
            {plantData.map((plant) => (
              <div
                key={plant.id}
                className="plant-card"
                onClick={() => handlePlantClick(plant)}
              >
                <div className="plant-emoji">{plant.emoji}</div>
                <div className="plant-info">
                  <h3 className="plant-name">{plant.commonName}</h3>
                  <p className="plant-scientific">{plant.scientificName}</p>
                  <div className="plant-details">
                    <span className="plant-category">{plant.category}</span>
                    <span className="plant-family">{plant.family}</span>
                  </div>
                  {plant.primaryUse && (
                    <p className="plant-use">Use: {plant.primaryUse}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                ← Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPlant.emoji} {selectedPlant.commonName}</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="plant-detail-section">
                <h3>Scientific Name</h3>
                <p>{selectedPlant.scientificName}</p>
              </div>
              <div className="plant-detail-section">
                <h3>Category</h3>
                <p>{selectedPlant.category}</p>
              </div>
              <div className="plant-detail-section">
                <h3>Family</h3>
                <p>{selectedPlant.family}</p>
              </div>
              {selectedPlant.primaryUse && (
                <div className="plant-detail-section">
                  <h3>Primary Use</h3>
                  <p>{selectedPlant.primaryUse}</p>
                </div>
              )}
              {selectedPlant.plantType && (
                <div className="plant-detail-section">
                  <h3>Plant Type</h3>
                  <p>{selectedPlant.plantType}</p>
                </div>
              )}
              {selectedPlant.climate && (
                <div className="plant-detail-section">
                  <h3>Climate</h3>
                  <p>{selectedPlant.climate}</p>
                </div>
              )}
              {selectedPlant.difficulty && (
                <div className="plant-detail-section">
                  <h3>Difficulty</h3>
                  <p>{selectedPlant.difficulty}</p>
                </div>
              )}
              {selectedPlant.growthTime && (
                <div className="plant-detail-section">
                  <h3>Growth Time</h3>
                  <p>{selectedPlant.growthTime}</p>
                </div>
              )}
              {selectedPlant.wateringFrequency && (
                <div className="plant-detail-section">
                  <h3>Watering Frequency</h3>
                  <p>{selectedPlant.wateringFrequency}</p>
                </div>
              )}
              {selectedPlant.sunlightNeeds && (
                <div className="plant-detail-section">
                  <h3>Sunlight Needs</h3>
                  <p>{selectedPlant.sunlightNeeds}</p>
                </div>
              )}
              {selectedPlant.matureHeight && (
                <div className="plant-detail-section">
                  <h3>Mature Height</h3>
                  <p>{selectedPlant.matureHeight}</p>
                </div>
              )}
              {selectedPlant.soilType && (
                <div className="plant-detail-section">
                  <h3>Soil Type</h3>
                  <p>{selectedPlant.soilType}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
