import Navigation from '@/components/Navigation';

export default function FastGrowing() {
  const fastGrowingPlants = [
    {
      id: 1,
      name: 'Radish',
      emoji: '🥬',
      growthTime: '3-4 weeks',
      difficulty: 'Easy',
      category: 'Vegetables',
      yield: 'High',
      tips: 'Plant in cool weather, harvest when roots are 1 inch in diameter'
    },
    {
      id: 2,
      name: 'Spinach',
      emoji: '🥬',
      growthTime: '4-6 weeks',
      difficulty: 'Easy',
      category: 'Leafy Greens',
      yield: 'High',
      tips: 'Plant in partial shade, harvest outer leaves first'
    },
    {
      id: 3,
      name: 'Lettuce',
      emoji: '🥬',
      growthTime: '6-8 weeks',
      difficulty: 'Easy',
      category: 'Leafy Greens',
      yield: 'High',
      tips: 'Plant in cool weather, harvest when leaves are 4-6 inches'
    },
    {
      id: 4,
      name: 'Green Onions',
      emoji: '🧅',
      growthTime: '3-4 weeks',
      difficulty: 'Easy',
      category: 'Herbs',
      yield: 'Medium',
      tips: 'Plant from seeds or regrow from store-bought onions'
    },
    {
      id: 5,
      name: 'Microgreens',
      emoji: '🌱',
      growthTime: '1-2 weeks',
      difficulty: 'Easy',
      category: 'Microgreens',
      yield: 'High',
      tips: 'Harvest when first true leaves appear, use for salads'
    },
    {
      id: 6,
      name: 'Arugula',
      emoji: '🥬',
      growthTime: '4-6 weeks',
      difficulty: 'Easy',
      category: 'Leafy Greens',
      yield: 'High',
      tips: 'Plant in cool weather, harvest young leaves for milder taste'
    },
    {
      id: 7,
      name: 'Bok Choy',
      emoji: '🥬',
      growthTime: '6-8 weeks',
      difficulty: 'Medium',
      category: 'Asian Greens',
      yield: 'High',
      tips: 'Plant in cool weather, harvest when heads are firm'
    },
    {
      id: 8,
      name: 'Cilantro',
      emoji: '🌿',
      growthTime: '3-4 weeks',
      difficulty: 'Easy',
      category: 'Herbs',
      yield: 'Medium',
      tips: 'Plant in cool weather, harvest leaves before flowering'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getYieldColor = (yield_: string) => {
    switch (yield_) {
      case 'High':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">⚡ Fast Growing Plants</h1>
          <p className="text-gray-400">Quick harvest plants for impatient gardeners</p>
        </div>

        {/* Fast Growing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              <div>
                <p className="text-gray-400 text-sm">Fastest Growth</p>
                <p className="text-green-400 text-2xl font-bold">1-2 weeks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌱</span>
              <div>
                <p className="text-gray-400 text-sm">Total Plants</p>
                <p className="text-white text-2xl font-bold">{fastGrowingPlants.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📈</span>
              <div>
                <p className="text-gray-400 text-sm">Avg Growth Time</p>
                <p className="text-blue-400 text-2xl font-bold">4.5 weeks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💚</span>
              <div>
                <p className="text-gray-400 text-sm">Easy to Grow</p>
                <p className="text-green-400 text-2xl font-bold">75%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {fastGrowingPlants.map((plant) => (
            <div key={plant.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{plant.emoji}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plant.name}</h3>
                    <p className="text-gray-400 text-sm">{plant.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">{plant.growthTime}</div>
                  <div className="text-gray-400 text-xs">Growth Time</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Difficulty</span>
                  <span className={`text-sm font-medium ${getDifficultyColor(plant.difficulty)}`}>
                    {plant.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Yield</span>
                  <span className={`text-sm font-medium ${getYieldColor(plant.yield)}`}>
                    {plant.yield}
                  </span>
                </div>
                
                <div className="pt-2">
                  <p className="text-gray-300 text-sm mb-2">💡 Growing Tip:</p>
                  <p className="text-gray-400 text-xs">{plant.tips}</p>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    🌱 Plant Now
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    📖 Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Growing Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">💡 Quick Growing Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-400">🌱</span>
                <div>
                  <div className="text-white font-medium">Start with Seeds</div>
                  <div className="text-gray-400 text-sm">Use fresh seeds for best germination rates</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400">💧</span>
                <div>
                  <div className="text-white font-medium">Consistent Watering</div>
                  <div className="text-gray-400 text-sm">Keep soil moist but not waterlogged</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-yellow-400">☀️</span>
                <div>
                  <div className="text-white font-medium">Proper Light</div>
                  <div className="text-gray-400 text-sm">Most fast-growing plants need 6-8 hours of sunlight</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-400">🌡️</span>
                <div>
                  <div className="text-white font-medium">Temperature Control</div>
                  <div className="text-gray-400 text-sm">Many fast growers prefer cool weather</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📅 Planting Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Spring Planting</div>
                  <div className="text-gray-400 text-sm">March - May</div>
                </div>
                <span className="text-green-400">🌱</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Fall Planting</div>
                  <div className="text-gray-400 text-sm">August - October</div>
                </div>
                <span className="text-blue-400">🍂</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Indoor Growing</div>
                  <div className="text-gray-400 text-sm">Year-round</div>
                </div>
                <span className="text-yellow-400">🏠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🏆 Success Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl mb-2">🥬</div>
              <div className="text-white font-medium mb-2">Microgreens</div>
              <div className="text-green-400 text-sm">Harvested in 10 days!</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl mb-2">🥬</div>
              <div className="text-white font-medium mb-2">Radish</div>
              <div className="text-green-400 text-sm">Ready in 3 weeks!</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl mb-2">🌿</div>
              <div className="text-white font-medium mb-2">Cilantro</div>
              <div className="text-green-400 text-sm">First harvest in 4 weeks!</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              🌱 Start Growing
            </button>
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📖 Growing Guide
            </button>
            <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              🛒 Buy Seeds
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              📱 Track Progress
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 