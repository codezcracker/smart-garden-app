'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

export default function Plants() {
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedClimate, setSelectedClimate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchInfo, setSearchInfo] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20', // Increased limit for better pagination
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedFamily && { family: selectedFamily }),
        ...(selectedClimate && { climate: selectedClimate }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/plants?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }
      
      const data = await response.json();
      setPlantData(data);
      setSearchInfo(data.searchInfo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, selectedFamily, selectedClimate, selectedCategory]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const getHealthColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-blue-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getGrowthColor = (growthTime) => {
    if (growthTime.includes('1 year') || growthTime.includes('2 years')) return 'text-green-400';
    if (growthTime.includes('3 years') || growthTime.includes('5 years')) return 'text-blue-400';
    if (growthTime.includes('10 years') || growthTime.includes('15 years')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedFamily('');
    setSelectedClimate('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  if (loading && !plantData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-900 dark:text-white text-xl">Loading plants...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-400 text-xl">Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🌱 Plants & Search</h1>
          <p className="text-gray-600 dark:text-gray-400">Search, filter, and manage your garden plants from our comprehensive database</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search plants by name, family, category, or climate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Families</option>
              {plantData?.filters.families.map((family) => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
            <select
              value={selectedClimate}
              onChange={(e) => setSelectedClimate(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Climates</option>
              {plantData?.filters.climates.map((climate) => (
                <option key={climate} value={climate}>{climate}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {plantData?.filters.categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={clearAllFilters}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchInfo && (searchInfo.searchTerm || searchInfo.resultsFound !== searchInfo.totalInDatabase) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  {searchInfo.searchTerm ? `Search results for "${searchInfo.searchTerm}"` : 'Filtered results'}
                </p>
                <p className="text-blue-600 dark:text-blue-300 text-sm">
                  Found {searchInfo.resultsFound.toLocaleString()} plants out of {searchInfo.totalInDatabase.toLocaleString()} total
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Plant Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌱</span>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Plants</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {searchInfo ? searchInfo.resultsFound.toLocaleString() : plantData?.pagination.totalPlants.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏷️</span>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Families</p>
                <p className="text-green-600 dark:text-green-400 text-2xl font-bold">{plantData?.filters.families.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌍</span>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Climates</p>
                <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{plantData?.filters.climates.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Categories</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">{plantData?.filters.categories.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plants Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-900 dark:text-white text-xl">Loading plants...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {plantData?.plants.map((plant) => (
                <div key={plant.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <span className="text-2xl lg:text-3xl">{plant.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{plant.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm truncate">{plant.category} • {plant.family}</p>
                      </div>
                    </div>
                    <span className={`text-xs lg:text-sm font-medium ${getHealthColor(plant.difficulty)} flex-shrink-0`}>
                      {plant.difficulty}
                    </span>
                  </div>
                  
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm">Climate</span>
                      <span className="text-gray-700 dark:text-gray-400 text-xs lg:text-sm truncate">{plant.climate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm">Growth Time</span>
                      <span className={`text-xs lg:text-sm font-medium ${getGrowthColor(plant.growthTime)}`}>
                        {plant.growthTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm">Family</span>
                      <span className="text-gray-700 dark:text-gray-400 text-xs lg:text-sm truncate">{plant.family}</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <button className="flex-1 bg-green-600 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg text-xs lg:text-sm hover:bg-green-700 transition-colors">
                        🌱 Add
                      </button>
                      <button className="flex-1 bg-blue-600 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg text-xs lg:text-sm hover:bg-blue-700 transition-colors">
                        📊 Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {plantData && plantData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mb-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!plantData.pagination.hasPrev}
                  className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-900 dark:text-white">
                  Page {plantData.pagination.page} of {plantData.pagination.totalPages} 
                  ({plantData.pagination.totalPlants.toLocaleString()} total plants)
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!plantData.pagination.hasNext}
                  className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Add Plant Button */}
        <div className="mt-8 text-center">
          <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
            🌱 Add New Plant
          </button>
        </div>
      </main>
    </div>
  );
} 