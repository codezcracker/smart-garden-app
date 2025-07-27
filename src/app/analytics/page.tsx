import Navigation from '@/components/Navigation';

export default function Analytics() {
  const metrics = [
    {
      id: 1,
      name: 'Water Usage',
      value: '15',
      unit: 'gallons',
      period: 'This Week',
      change: '+20%',
      trend: 'up',
      icon: '💧'
    },
    {
      id: 2,
      name: 'Energy Consumption',
      value: '3.2',
      unit: 'kWh/day',
      period: 'Average',
      change: '-12%',
      trend: 'down',
      icon: '⚡'
    },
    {
      id: 3,
      name: 'Plant Growth',
      value: '75',
      unit: '%',
      period: 'Average',
      change: '+15%',
      trend: 'up',
      icon: '📈'
    },
    {
      id: 4,
      name: 'Health Score',
      value: '8.5',
      unit: '/10',
      period: 'Current',
      change: '+0.3',
      trend: 'up',
      icon: '💚'
    }
  ];

  const weeklyData = [
    { day: 'Mon', water: 12, energy: 3.1, growth: 70 },
    { day: 'Tue', water: 14, energy: 3.3, growth: 72 },
    { day: 'Wed', water: 13, energy: 3.0, growth: 74 },
    { day: 'Thu', water: 15, energy: 3.2, growth: 75 },
    { day: 'Fri', water: 16, energy: 3.4, growth: 76 },
    { day: 'Sat', water: 17, energy: 3.5, growth: 77 },
    { day: 'Sun', water: 15, energy: 3.2, growth: 75 }
  ];

  const plantPerformance = [
    { name: 'Tomatoes', growth: 85, health: 9.2, yield: 12 },
    { name: 'Basil', growth: 60, health: 7.8, yield: 8 },
    { name: 'Lettuce', growth: 90, health: 9.5, yield: 15 },
    { name: 'Strawberries', growth: 75, health: 8.7, yield: 10 },
    { name: 'Mint', growth: 95, health: 9.8, yield: 18 }
  ];

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : '↘️';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Analytics</h1>
          <p className="text-gray-400">Comprehensive insights into your garden&apos;s performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <span className="text-xl lg:text-2xl">{metric.icon}</span>
                <div className={`flex items-center space-x-1 text-xs lg:text-sm ${getTrendColor(metric.trend)}`}>
                  <span>{getTrendIcon(metric.trend)}</span>
                  <span>{metric.change}</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  {metric.value} {metric.unit}
                </div>
                <div className="text-gray-400 text-xs lg:text-sm">{metric.name}</div>
              </div>
              <div className="text-gray-500 text-xs">{metric.period}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {/* Weekly Trends */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📈 Weekly Trends</h3>
            <div className="space-y-4">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 w-12">{data.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 text-sm">💧</span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(data.water / 20) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{data.water}L</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 text-sm">⚡</span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(data.energy / 4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{data.energy}kWh</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">{data.growth}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Performance */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🌱 Plant Performance</h3>
            <div className="space-y-4">
              {plantPerformance.map((plant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌱</span>
                    <div>
                      <div className="text-white font-medium">{plant.name}</div>
                      <div className="text-gray-400 text-sm">Yield: {plant.yield} units</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">{plant.growth}%</div>
                    <div className="text-blue-400 text-sm">{plant.health}/10</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Water Usage Analysis */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">💧 Water Usage Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">This Week</span>
                <span className="text-green-400 font-semibold">15 gallons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Week</span>
                <span className="text-gray-400">12 gallons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Savings</span>
                <span className="text-green-400">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Efficiency</span>
                <span className="text-blue-400">85%</span>
              </div>
            </div>
          </div>

          {/* Energy Analysis */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">⚡ Energy Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Daily Average</span>
                <span className="text-yellow-400 font-semibold">3.2 kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Monthly Total</span>
                <span className="text-gray-400">96 kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Cost</span>
                <span className="text-red-400">$28.80</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Efficiency</span>
                <span className="text-green-400">88%</span>
              </div>
            </div>
          </div>

          {/* Growth Analysis */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📈 Growth Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Growth</span>
                <span className="text-green-400 font-semibold">75%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Health Score</span>
                <span className="text-blue-400">8.5/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Yield Increase</span>
                <span className="text-green-400">+15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Success Rate</span>
                <span className="text-yellow-400">92%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">💰 Cost Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">$45</div>
              <div className="text-gray-400 text-sm">Monthly Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">$28.80</div>
              <div className="text-gray-400 text-sm">Energy Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">$12.50</div>
              <div className="text-gray-400 text-sm">Water Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">$540</div>
              <div className="text-gray-400 text-sm">Annual Savings</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📊 Export Report
            </button>
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              📈 Detailed Charts
            </button>
            <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              📅 Historical Data
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              ⚙️ Analytics Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 