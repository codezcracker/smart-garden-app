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
    return status === 'Online' ? 'text-green-500' : 'text-red-500';
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
        if (value < 30) return 'text-red-500';
        if (value < 50) return 'text-yellow-500';
        return 'text-green-500';
      case 'Temperature':
        if (value < 50 || value > 90) return 'text-red-500';
        if (value < 60 || value > 80) return 'text-yellow-500';
        return 'text-green-500';
      case 'Humidity':
        if (value < 30 || value > 70) return 'text-red-500';
        if (value < 40 || value > 60) return 'text-yellow-500';
        return 'text-green-500';
      case 'pH':
        if (value < 6.0 || value > 7.5) return 'text-red-500';
        if (value < 6.5 || value > 7.0) return 'text-yellow-500';
        return 'text-green-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">📡</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Sensors</h1>
              <p className="text-gray-600">Real-time monitoring of your garden&apos;s environmental conditions</p>
            </div>
          </div>
        </div>

        {/* Sensor Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 lg:p-6 border border-blue-200">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">📡</span>
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Total Sensors</p>
                <p className="text-gray-900 text-xl lg:text-2xl font-bold">{sensors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-4 lg:p-6 border border-green-200">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">🟢</span>
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Online</p>
                <p className="text-green-600 text-xl lg:text-2xl font-bold">
                  {sensors.filter(s => s.status === 'Online').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">⚠️</span>
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Alerts</p>
                <p className="text-yellow-600 text-xl lg:text-2xl font-bold">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-4 lg:p-6 border border-purple-200">
            <div className="flex items-center">
              <span className="text-xl lg:text-2xl mr-3">⚡</span>
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Battery</p>
                <p className="text-purple-600 text-xl lg:text-2xl font-bold">87%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sensors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sensor.name}</h3>
                  <p className="text-gray-600 text-sm">{sensor.location}</p>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${getStatusColor(sensor.status)} bg-gray-100`}>
                  {sensor.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-700 text-sm font-medium">Current Value</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${getValueColor(sensor.type, sensor.value)}`}>
                      {sensor.value}{sensor.unit}
                    </span>
                    <span className="text-lg">{getTrendIcon(sensor.trend)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm font-medium">Type</span>
                  <span className="text-gray-700 text-sm">{sensor.type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm font-medium">Last Update</span>
                  <span className="text-gray-700 text-sm">{sensor.lastUpdate}</span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <span className="flex items-center justify-center space-x-1">
                      <span>📊</span>
                      <span>History</span>
                    </span>
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <span className="flex items-center justify-center space-x-1">
                      <span>⚙️</span>
                      <span>Configure</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sensor Alerts */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-lg p-6 border border-red-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Recent Alerts</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 bg-white border border-red-200 rounded-lg">
                <span className="text-red-500 text-lg">🔴</span>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">Soil Moisture Sensor 3: Low moisture detected (58%)</p>
                  <p className="text-gray-500 text-xs">3 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white border border-yellow-200 rounded-lg">
                <span className="text-yellow-500 text-lg">🟡</span>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">Humidity Sensor: Humidity dropping (45%)</p>
                  <p className="text-gray-500 text-xs">45 seconds ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>🔄</span>
                <span>Refresh All</span>
              </span>
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>📊</span>
                <span>View Analytics</span>
              </span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>⚙️</span>
                <span>Sensor Settings</span>
              </span>
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Mobile App</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 