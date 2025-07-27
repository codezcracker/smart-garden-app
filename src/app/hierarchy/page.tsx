import Navigation from '@/components/Navigation';

export default function Hierarchy() {
  const plantHierarchy = [
    {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Magnoliopsida',
      order: 'Solanales',
      family: 'Solanaceae',
      genus: 'Solanum',
      species: 'Solanum lycopersicum',
      commonName: 'Tomato',
      count: 12
    },
    {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Magnoliopsida',
      order: 'Lamiales',
      family: 'Lamiaceae',
      genus: 'Ocimum',
      species: 'Ocimum basilicum',
      commonName: 'Basil',
      count: 8
    },
    {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Magnoliopsida',
      order: 'Asterales',
      family: 'Asteraceae',
      genus: 'Lactuca',
      species: 'Lactuca sativa',
      commonName: 'Lettuce',
      count: 15
    },
    {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Magnoliopsida',
      order: 'Rosales',
      family: 'Rosaceae',
      genus: 'Fragaria',
      species: 'Fragaria × ananassa',
      commonName: 'Strawberry',
      count: 6
    },
    {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Magnoliopsida',
      order: 'Lamiales',
      family: 'Lamiaceae',
      genus: 'Mentha',
      species: 'Mentha spicata',
      commonName: 'Mint',
      count: 10
    }
  ];

  const taxonomyLevels = [
    { level: 'Kingdom', count: 1, color: 'bg-red-500' },
    { level: 'Phylum', count: 1, color: 'bg-orange-500' },
    { level: 'Class', count: 1, color: 'bg-yellow-500' },
    { level: 'Order', count: 4, color: 'bg-green-500' },
    { level: 'Family', count: 4, color: 'bg-blue-500' },
    { level: 'Genus', count: 5, color: 'bg-purple-500' },
    { level: 'Species', count: 5, color: 'bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🌳 Plant Hierarchy</h1>
          <p className="text-gray-400">Taxonomic classification and plant organization system</p>
        </div>

        {/* Hierarchy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌱</span>
              <div>
                <p className="text-gray-400 text-sm">Total Plants</p>
                <p className="text-white text-2xl font-bold">51</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏷️</span>
              <div>
                <p className="text-gray-400 text-sm">Species</p>
                <p className="text-green-400 text-2xl font-bold">5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="text-gray-400 text-sm">Families</p>
                <p className="text-blue-400 text-2xl font-bold">4</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="text-gray-400 text-sm">Orders</p>
                <p className="text-yellow-400 text-2xl font-bold">4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taxonomic Pyramid */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">🏛️ Taxonomic Hierarchy</h3>
          <div className="flex flex-col items-center space-y-2">
            {taxonomyLevels.map((level, index) => (
              <div key={index} className="flex items-center w-full max-w-2xl">
                <div className={`${level.color} text-white px-4 py-2 rounded-lg text-sm font-medium min-w-24 text-center`}>
                  {level.level}
                </div>
                <div className="flex-1 bg-gray-700 h-1 mx-4"></div>
                <div className="text-white font-semibold min-w-12 text-center">{level.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Plant Classification Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">📋 Plant Classification</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300">Common Name</th>
                  <th className="text-left py-3 px-4 text-gray-300">Species</th>
                  <th className="text-left py-3 px-4 text-gray-300">Family</th>
                  <th className="text-left py-3 px-4 text-gray-300">Order</th>
                  <th className="text-left py-3 px-4 text-gray-300">Count</th>
                  <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plantHierarchy.map((plant, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🌱</span>
                        <span className="text-white font-medium">{plant.commonName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 italic">{plant.species}</td>
                    <td className="py-3 px-4 text-gray-300">{plant.family}</td>
                    <td className="py-3 px-4 text-gray-300">{plant.order}</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        {plant.count}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                          View
                        </button>
                        <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Family Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">👥 Family Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Solanaceae</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                  <span className="text-red-400 text-sm">12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Lamiaceae</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-blue-400 text-sm">18</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Asteraceae</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '29%' }}></div>
                  </div>
                  <span className="text-green-400 text-sm">15</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Rosaceae</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <span className="text-yellow-400 text-sm">6</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Classification Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Most Common Family</span>
                <span className="text-blue-400">Lamiaceae (18)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Most Common Order</span>
                <span className="text-green-400">Lamiales (28)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Average per Species</span>
                <span className="text-yellow-400">10.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Diversity Index</span>
                <span className="text-purple-400">0.78</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🔍 Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Search plants..." 
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <select className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
              <option>All Families</option>
              <option>Solanaceae</option>
              <option>Lamiaceae</option>
              <option>Asteraceae</option>
              <option>Rosaceae</option>
            </select>
            <select className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
              <option>All Orders</option>
              <option>Solanales</option>
              <option>Lamiales</option>
              <option>Asterales</option>
              <option>Rosales</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              🌱 Add Plant
            </button>
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📊 Export Data
            </button>
            <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              🏷️ Manage Taxonomy
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              📚 Plant Database
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 