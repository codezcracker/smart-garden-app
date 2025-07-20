'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../theme-context';

export default function PlantsPage() {
  const { theme } = useTheme();
  const [plants, setPlants] = useState([]);
  const [totalPlants, setTotalPlants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [categories, setCategories] = useState([{ name: 'all', count: 0 }]);
  const [families, setFamilies] = useState([{ name: 'all', count: 0 }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [listLoading, setListLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const plantsPerPage = 24; // Show 24 plants per page (6 rows x 4 columns)
  const [isSearching, setIsSearching] = useState(false);

  const fetchPlantsFromConvertedCSV = async (search = '', isFilterChange = false) => {
    try {
      if (isFilterChange) {
        setListLoading(true);
        setCurrentPage(1); // Reset to first page when filters change
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        limit: '24', // Show 24 plants per page (6 rows x 4 columns)
        page: currentPage.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (selectedFamily !== 'all') {
        params.append('family', selectedFamily);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/plants-converted?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPlants(data.plants);
        setTotalPlants(data.total || 0);
        setCategories(data.categories || [{ name: 'all', count: 0 }]);
        setFamilies(data.families || [{ name: 'all', count: 0 }]);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.error || 'Failed to fetch plants');
      }
    } catch (err) {
      setError('Failed to fetch plants from converted CSV');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setListLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchPlantsFromConvertedCSV();
  }, []);

  // Debounced search for better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        setIsSearching(true);
        fetchPlantsFromConvertedCSV(searchTerm, true);
      } else {
        fetchPlantsFromConvertedCSV('', true);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedFamily, currentPage]);



  // Get unique categories from plants (for display purposes)
  const plantCategories = ['all', ...new Set(plants.map(plant => plant.family || 'Unknown').filter(Boolean))];

  // Filter plants based on search, family, and category
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.family?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = selectedFamily === 'all' || plant.family === selectedFamily;
    const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;
    return matchesSearch && matchesFamily && matchesCategory;
  });

  // Show all plants (no pagination limits)
  const paginatedPlants = filteredPlants;

  const openModal = (plant) => {
    setSelectedPlant(plant);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlant(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="error-container">
          <h2 className="text-xl font-semibold mb-4">Error Loading Plants</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPlantsFromConvertedCSV}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plants-container">
      {/* Header */}
      <div className="plants-header">
        <h1 className="plants-title">Plant Database</h1>
        <p className="plants-subtitle">
          Discover {totalPlants.toLocaleString()} plant species from around the world
        </p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {isSearching && <div className="search-spinner"></div>}
        </div>
        
        <div className="filter-box">
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="filter-select"
          >
            {families.map(family => (
              <option key={family.name} value={family.name}>
                {family.name === 'all' ? `All Families (${family.count.toLocaleString()})` : `${family.name} (${family.count.toLocaleString()})`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-box">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name === 'all' ? `All Categories (${category.count.toLocaleString()})` : `${category.name} (${category.count.toLocaleString()})`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Card View"
          >
            📋
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            📝
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {plants.length.toLocaleString()} plants
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedFamily !== 'all' && ` in ${selectedFamily} family`}
          {selectedCategory !== 'all' && ` of ${selectedCategory} type`}
        </p>
        {listLoading && <div className="list-loading">🔄 Loading plants...</div>}
      </div>

      {/* Plants Display */}
      {viewMode === 'cards' ? (
        <div className="plants-grid">
          {paginatedPlants.map((plant, index) => (
            <div
              key={`${plant.name}-${index}`}
              className="plant-card"
              onClick={() => openModal(plant)}
            >
              <div className="plant-card-header">
                <h3 className="plant-name">{plant.name || 'Unknown Plant'}</h3>
                <span className="plant-emoji">{plant.emoji || '🪴'}</span>
              </div>
              
              <div className="plant-card-body">
                <div className="plant-info">
                  <span className="info-label">Family:</span>
                  <span className="info-value">{plant.family || 'Unknown'}</span>
                </div>
                
                <div className="plant-info">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{plant.category || 'Unknown'}</span>
                </div>
                
                {plant.climate && plant.climate !== 'Unknown' && (
                  <div className="plant-info">
                    <span className="info-label">Climate:</span>
                    <span className="info-value">{plant.climate}</span>
                  </div>
                )}
                
                {plant.difficulty && plant.difficulty !== 'Unknown' && (
                  <div className="plant-info">
                    <span className="info-label">Difficulty:</span>
                    <span className="info-value">{plant.difficulty}</span>
                  </div>
                )}
              </div>
              
              <div className="plant-card-footer">
                <span className="view-details">Click to view details</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="plants-list">
          {paginatedPlants.map((plant, index) => (
            <div
              key={`${plant.name}-${index}`}
              className="plant-list-item"
              onClick={() => openModal(plant)}
            >
              <div className="plant-list-emoji">{plant.emoji || '🪴'}</div>
              <div className="plant-list-content">
                <h3 className="plant-list-name">{plant.name || 'Unknown Plant'}</h3>
                <div className="plant-list-details">
                  <span className="plant-list-family">{plant.family || 'Unknown'}</span>
                  <span className="plant-list-category">{plant.category || 'Unknown'}</span>
                  {plant.climate && plant.climate !== 'Unknown' && (
                    <span className="plant-list-climate">{plant.climate}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {plants.length.toLocaleString()} plants
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedFamily !== 'all' && ` in ${selectedFamily} family`}
          {selectedCategory !== 'all' && ` of ${selectedCategory} type`}
          {` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || listLoading}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={listLoading}
                  className={`pagination-num ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <div className="pagination-extra">
                <span className="pagination-ellipsis">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={listLoading}
                  className={`pagination-num ${currentPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || listLoading}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Plant Details Modal */}
      {showModal && selectedPlant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedPlant.name || 'Unknown Plant'}</h2>
              <span className="modal-emoji">{selectedPlant.emoji || '🪴'}</span>
              <button onClick={closeModal} className="modal-close">&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="plant-details">
                <div className="detail-row">
                  <span className="detail-label">Plant Name:</span>
                  <span className="detail-value">{selectedPlant.name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Family:</span>
                  <span className="detail-value">{selectedPlant.family || 'Unknown'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedPlant.category || 'Unknown'}</span>
                </div>
                
                {selectedPlant.climate && selectedPlant.climate !== 'Unknown' && (
                  <div className="detail-row">
                    <span className="detail-label">Climate:</span>
                    <span className="detail-value">{selectedPlant.climate}</span>
                  </div>
                )}
                
                {selectedPlant.difficulty && selectedPlant.difficulty !== 'Unknown' && (
                  <div className="detail-row">
                    <span className="detail-label">Difficulty:</span>
                    <span className="detail-value">{selectedPlant.difficulty}</span>
                  </div>
                )}
                
                {selectedPlant.growthTime && selectedPlant.growthTime !== 'Unknown' && (
                  <div className="detail-row">
                    <span className="detail-label">Growth Time:</span>
                    <span className="detail-value">{selectedPlant.growthTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 