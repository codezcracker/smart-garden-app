'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

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

interface PlantStats {
  totalPlants: number;
  families: { [key: string]: number };
  climates: { [key: string]: number };
  categories: { [key: string]: number };
  difficulties: { [key: string]: number };
  growthTimes: { [key: string]: number };
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

export default function FullDatabase() {
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [stats, setStats] = useState<PlantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedClimate, setSelectedClimate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50', // Show more plants per page for the full database
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedFamily && { family: selectedFamily }),
        ...(selectedClimate && { climate: selectedClimate }),
        ...(selectedCategory && { category: selectedCategory })
      });

      console.log(`Fetching full database plants with params: ${params.toString()}`);
      const response = await fetch(`/api/plants-ultimate?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch plants`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPlantData(data);
      setSearchInfo(data.searchInfo);
      console.log(`Received ${data.plants?.length || 0} plants, total: ${data.pagination?.totalPlants?.toLocaleString() || 0}`);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching plants');
      setPlantData(null);
      setSearchInfo(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, selectedFamily, selectedClimate, selectedCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/plants-ultimate?action=stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
    fetchStats();
  }, [fetchPlants, fetchStats]);

  const getHealthColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-500';
      case 'Medium':
        return 'text-blue-500';
      case 'Hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getGrowthColor = (growthTime: string) => {
    if (growthTime.includes('1 year') || growthTime.includes('2 years')) return 'text-green-500';
    if (growthTime.includes('3 years') || growthTime.includes('5 years')) return 'text-blue-500';
    if (growthTime.includes('10 years') || growthTime.includes('15 years')) return 'text-yellow-500';
    return 'text-red-500';
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedFamily('');
    setSelectedClimate('');
    setSelectedCategory('');
    setCurrentPage(1);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Generate search suggestions based on available data
  const generateSearchSuggestions = (term: string) => {
    if (!term || term.length < 2 || !plantData) return [];
    
    const suggestions = new Set<string>();
    const termLower = term.toLowerCase();
    
    // Add family suggestions
    plantData.filters.families.forEach((family: string) => {
      if (family.toLowerCase().includes(termLower)) {
        suggestions.add(family);
      }
    });
    
    // Add climate suggestions
    plantData.filters.climates.forEach((climate: string) => {
      if (climate.toLowerCase().includes(termLower)) {
        suggestions.add(climate);
      }
    });
    
    // Add category suggestions
    plantData.filters.categories.forEach((category: string) => {
      if (category.toLowerCase().includes(termLower)) {
        suggestions.add(category);
      }
    });
    
    // Add plant names from the current page
    if (plantData.plants) {
      plantData.plants.forEach((plant: Plant) => {
        if (plant.name.toLowerCase().includes(termLower)) {
          suggestions.add(plant.name);
        }
      });
    }
    
    return Array.from(suggestions).slice(0, 8);
  };

  if (loading && !plantData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-900 text-xl">Loading full plant database...</div>
            <div className="text-gray-600 text-sm mt-2">This may take a moment for the first load</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-red-600 text-xl font-semibold mb-2">⚠️ Database Error</div>
              <div className="text-red-500 text-sm mb-4">{error}</div>
              <button
                onClick={() => {
                  setError(null);
                  fetchPlants();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">🌍</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Full Plant Database</h1>
              <p className="text-gray-600">Search through our complete database of 2.5+ million plants</p>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        {stats && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-200 mb-8">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">📊 Database Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalPlants.toLocaleString()}</div>
                <div className="text-sm text-purple-700">Total Plants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.families).length}</div>
                <div className="text-sm text-purple-700">Plant Families</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.climates).length}</div>
                <div className="text-sm text-purple-700">Climate Zones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.categories).length}</div>
                <div className="text-sm text-purple-700">Categories</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200 mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search 2.5M+ plants by name, family, category, or climate..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  const suggestions = generateSearchSuggestions(value);
                  setSearchSuggestions(suggestions);
                  setShowSuggestions(suggestions.length > 0);
                }}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="w-full bg-white text-gray-900 px-4 py-3 pl-12 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                {loading ? '⏳' : '🔍'}
              </span>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-blue-300 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setShowSuggestions(false);
                        setSearchSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors duration-150"
                    >
                      <span className="flex items-center space-x-2">
                        <span className="text-blue-400">🔍</span>
                        <span>{suggestion}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full bg-white text-gray-900 px-4 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="">All Families</option>
              {plantData?.filters.families.map((family: string) => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
            <select
              value={selectedClimate}
              onChange={(e) => setSelectedClimate(e.target.value)}
              className="w-full bg-white text-gray-900 px-4 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="">All Climates</option>
              {plantData?.filters.climates.map((climate: string) => (
                <option key={climate} value={climate}>{climate}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white text-gray-900 px-4 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="">All Categories</option>
              {plantData?.filters.categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={clearAllFilters}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>🗑️</span>
                <span>Clear All</span>
              </span>
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchInfo && (searchInfo.searchTerm || searchInfo.resultsFound !== searchInfo.totalInDatabase) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-blue-800 font-medium">
                  {searchInfo.searchTerm ? `Search results for "${searchInfo.searchTerm}"` : 'Filtered results'}
                </p>
                <p className="text-blue-600 text-sm">
                  Found {searchInfo.resultsFound.toLocaleString()} plants out of {searchInfo.totalInDatabase.toLocaleString()} total
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start sm:self-auto bg-white px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Plants Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-900 text-xl">Loading plants...</div>
          </div>
        ) : plantData && plantData.plants && plantData.plants.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-gray-900 text-xl font-semibold mb-2">No plants found</h3>
              <p className="text-gray-600 text-sm mb-4">
                {searchInfo?.searchTerm 
                  ? `No plants match your search for "${searchInfo.searchTerm}"`
                  : 'No plants match your current filters'
                }
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
              {plantData?.plants.map((plant: Plant) => (
                <div key={plant.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <span className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0">{plant.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{plant.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm truncate">{plant.category} • {plant.family}</p>
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${getHealthColor(plant.difficulty)} flex-shrink-0 ml-2 px-2 py-1 rounded-full bg-gray-100`}>
                      {plant.difficulty}
                    </span>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs sm:text-sm font-medium">Climate</span>
                      <span className="text-gray-700 text-xs sm:text-sm truncate max-w-[60%]">{plant.climate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs sm:text-sm font-medium">Growth Time</span>
                      <span className={`text-xs sm:text-sm font-medium ${getGrowthColor(plant.growthTime)} truncate max-w-[60%]`}>
                        {plant.growthTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs sm:text-sm font-medium">Family</span>
                      <span className="text-gray-700 text-xs sm:text-sm truncate max-w-[60%]">{plant.family}</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2 sm:pt-3">
                      <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-lg text-xs sm:text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <span className="flex items-center justify-center space-x-1">
                          <span>🌱</span>
                          <span>Add</span>
                        </span>
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg text-xs sm:text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <span className="flex items-center justify-center space-x-1">
                          <span>📊</span>
                          <span>Details</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {plantData && plantData.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!plantData.pagination.hasPrev}
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>←</span>
                    <span>Previous</span>
                  </span>
                </button>
                <span className="text-gray-900 text-center text-sm sm:text-base bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  Page {plantData.pagination.page} of {plantData.pagination.totalPages} 
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> • </span>
                  ({plantData.pagination.totalPlants.toLocaleString()} total plants)
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!plantData.pagination.hasNext}
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Next</span>
                    <span>→</span>
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Add Plant Button */}
        <div className="mt-8 text-center">
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <span className="flex items-center justify-center space-x-2 text-lg">
              <span>🌱</span>
              <span>Add New Plant</span>
            </span>
          </button>
        </div>
      </main>
    </div>
  );
} 