import Navigation from '@/components/Navigation';

export default function Sensors() {
  const sensors = [
    {
      id: 1,
      name: 'Soil Moisture Sensor 1',
      type: 'Moisture',
      value: 65,
      unit: '%',
      status: 'Online',
      location: 'Garden Bed A',
      lastUpdate: '2 minutes ago',
      trend: 'stable'
    },
    {
      id: 2,
      name: 'Soil Moisture Sensor 2',
      type: 'Moisture',
      value: 72,
      unit: '%',
      status: 'Online',
      location: 'Garden Bed B',
      lastUpdate: '1 minute ago',
      trend: 'increasing'
    },
    {
      id: 3,
      name: 'Soil Moisture Sensor 3',
      type: 'Moisture',
      value: 58,
      unit: '%',
      status: 'Online',
      location: 'Garden Bed C',
      lastUpdate: '3 minutes ago',
      trend: 'decreasing'
    },
    {
      id: 4,
      name: 'Air Temperature Sensor',
      type: 'Temperature',
      value: 72,
      unit: '°F',
      status: 'Online',
      location: 'Greenhouse',
      lastUpdate: '30 seconds ago',
      trend: 'stable'
    },
    {
      id: 5,
      name: 'Soil Temperature Sensor',
      type: 'Temperature',
      value: 68,
      unit: '°F',
      status: 'Online',
      location: 'Garden Bed A',
      lastUpdate: '1 minute ago',
      trend: 'stable'
    },
    {
      id: 6,
      name: 'Humidity Sensor',
      type: 'Humidity',
      value: 45,
      unit: '%',
      status: 'Online',
      location: 'Greenhouse',
      lastUpdate: '45 seconds ago',
      trend: 'decreasing'
    },
    {
      id: 7,
      name: 'Light Sensor',
      type: 'Light',
      value: 850,
      unit: 'lux',
      status: 'Online',
      location: 'Greenhouse',
      lastUpdate: '1 minute ago',
      trend: 'increasing'
    },
    {
      id: 8,
      name: 'pH Sensor',
      type: 'pH',
      value: 6.8,
      unit: '',
      status: 'Online',
      location: 'Garden Bed B',
      lastUpdate: '5 minutes ago',
      trend: 'stable'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'Online' ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getValueColor = (type: string, value: number) => {
    switch (type) {
      case 'Moisture':
        if (value < 30) return 'text-red-400';
        if (value < 50) return 'text-yellow-400';
        return 'text-green-400';
      case 'Temperature':
        if (value < 50 || value > 90) return 'text-red-400';
        if (value < 60 || value > 80) return 'text-yellow-400';
        return 'text-green-400';
      case 'Humidity':
        if (value < 30 || value > 70) return 'text-red-400';
        if (value < 40 || value > 60) return 'text-yellow-400';
        return 'text-green-400';
      case 'pH':
        if (value < 6.0 || value > 7.5) return 'text-red-400';
        if (value < 6.5 || value > 7.0) return 'text-yellow-400';
        return 'text-green-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📡 Sensors</h1>
          <p className="text-gray-400">Real-time monitoring of your garden&apos;s environmental conditions</p>
        </div>

        {/* Sensor Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">📡</span>
              <div>
                <p className="text-gray-400 text-xs lg:text-sm">Total Sensors</p>
                <p className="text-white text-xl lg:text-2xl font-bold">{sensors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">🟢</span>
              <div>
                <p className="text-gray-400 text-xs lg:text-sm">Online</p>
                <p className="text-green-400 text-xl lg:text-2xl font-bold">
                  {sensors.filter(s => s.status === 'Online').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">⚠️</span>
              <div>
                <p className="text-gray-400 text-xs lg:text-sm">Alerts</p>
                <p className="text-yellow-400 text-xl lg:text-2xl font-bold">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">⚡</span>
              <div>
                <p className="text-gray-400 text-xs lg:text-sm">Battery</p>
                <p className="text-blue-400 text-xl lg:text-2xl font-bold">87%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sensors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{sensor.name}</h3>
                  <p className="text-gray-400 text-sm">{sensor.location}</p>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Current Value</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${getValueColor(sensor.type, sensor.value)}`}>
                      {sensor.value}{sensor.unit}
                    </span>
                    <span className="text-lg">{getTrendIcon(sensor.trend)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Type</span>
                  <span className="text-gray-400 text-sm">{sensor.type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Last Update</span>
                  <span className="text-gray-400 text-sm">{sensor.lastUpdate}</span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    📊 History
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    ⚙️ Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sensor Alerts */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">⚠️ Recent Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <span className="text-red-400">🔴</span>
                <div>
                  <p className="text-white text-sm">Soil Moisture Sensor 3: Low moisture detected (58%)</p>
                  <p className="text-gray-400 text-xs">3 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <span className="text-yellow-400">🟡</span>
                <div>
                  <p className="text-white text-sm">Humidity Sensor: Humidity dropping (45%)</p>
                  <p className="text-gray-400 text-xs">45 seconds ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              🔄 Refresh All
            </button>
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📊 View Analytics
            </button>
            <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              ⚙️ Sensor Settings
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              📱 Mobile App
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 