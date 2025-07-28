import Navigation from '@/components/Navigation';

export default function Weather() {
  const currentWeather = {
    temperature: 72,
    humidity: 45,
    wind: 5,
    uvIndex: 'Moderate',
    condition: 'Sunny',
    icon: '☀️',
    feelsLike: 74
  };

  const forecast = [
    { day: 'Today', temp: 75, condition: 'Sunny', icon: '☀️' },
    { day: 'Tomorrow', temp: 70, condition: 'Partly Cloudy', icon: '⛅' },
    { day: 'Wednesday', temp: 68, condition: 'Cloudy', icon: '☁️' },
    { day: 'Thursday', temp: 65, condition: 'Rain', icon: '🌧️' },
    { day: 'Friday', temp: 72, condition: 'Partly Cloudy', icon: '⛅' },
    { day: 'Saturday', temp: 78, condition: 'Sunny', icon: '☀️' },
    { day: 'Sunday', temp: 75, condition: 'Sunny', icon: '☀️' }
  ];

  const weatherAlerts = [
    {
      type: 'UV Warning',
      message: 'High UV index expected today. Consider shade for sensitive plants.',
      severity: 'moderate',
      time: '2 hours ago'
    },
    {
      type: 'Wind Alert',
      message: 'Wind speeds may affect outdoor plants. Secure any loose items.',
      severity: 'low',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">🌤️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Weather</h1>
              <p className="text-gray-600">Current weather conditions and forecast for your garden</p>
            </div>
          </div>
        </div>

        {/* Current Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg p-4 lg:p-8 border border-sky-200">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Current Conditions</h2>
                <p className="text-gray-600 text-sm lg:text-base">Updated just now</p>
              </div>
              <div className="text-right">
                <div className="text-4xl lg:text-6xl mb-2">{currentWeather.icon}</div>
                <div className="text-gray-600 text-sm lg:text-base">{currentWeather.condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center p-3 bg-white rounded-lg border border-sky-100">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{currentWeather.temperature}°F</div>
                <div className="text-gray-600 text-xs lg:text-sm font-medium">Temperature</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-sky-100">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{currentWeather.humidity}%</div>
                <div className="text-gray-600 text-xs lg:text-sm font-medium">Humidity</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-sky-100">
                <div className="text-2xl lg:text-3xl font-bold text-gray-700 mb-1">{currentWeather.wind} mph</div>
                <div className="text-gray-600 text-xs lg:text-sm font-medium">Wind Speed</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-sky-100">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">{currentWeather.uvIndex}</div>
                <div className="text-gray-600 text-xs lg:text-sm font-medium">UV Index</div>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-sky-200">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-sky-100">
                <span className="text-gray-700 text-sm lg:text-base font-medium">Feels Like</span>
                <span className="text-gray-900 text-lg lg:text-xl font-semibold">{currentWeather.feelsLike}°F</span>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Weather Alerts</span>
            </h3>
            <div className="space-y-3 lg:space-y-4">
              {weatherAlerts.map((alert, index) => (
                <div key={index} className="p-4 bg-white border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 text-lg">⚠️</span>
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium text-sm">{alert.type}</div>
                      <div className="text-gray-600 text-xs mt-1">{alert.message}</div>
                      <div className="text-gray-500 text-xs mt-2">{alert.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <span>📅</span>
            <span>7-Day Forecast</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="text-gray-600 text-sm mb-2 font-medium">{day.day}</div>
                <div className="text-3xl mb-2">{day.icon}</div>
                <div className="text-gray-900 font-semibold mb-1">{day.temp}°F</div>
                <div className="text-gray-500 text-xs">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Impact on Garden */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>🌱</span>
              <span>Garden Impact</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                <span className="text-gray-700 font-medium">Watering Needs</span>
                <span className="text-green-600 font-semibold">Normal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                <span className="text-gray-700 font-medium">Sun Exposure</span>
                <span className="text-yellow-600 font-semibold">High</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                <span className="text-gray-700 font-medium">Frost Risk</span>
                <span className="text-green-600 font-semibold">Low</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                <span className="text-gray-700 font-medium">Wind Protection</span>
                <span className="text-blue-600 font-semibold">Recommended</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>📊</span>
              <span>Weather Trends</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                <span className="text-gray-700 font-medium">Temperature Trend</span>
                <span className="text-green-600 font-semibold">↗️ Warming</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                <span className="text-gray-700 font-medium">Humidity Trend</span>
                <span className="text-red-600 font-semibold">↘️ Decreasing</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                <span className="text-gray-700 font-medium">Precipitation</span>
                <span className="text-blue-600 font-semibold">↗️ Increasing</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                <span className="text-gray-700 font-medium">Growing Season</span>
                <span className="text-green-600 font-semibold">Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Recommendations */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border border-orange-200 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <span>💡</span>
            <span>Garden Recommendations</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white border border-green-200 rounded-lg hover:shadow-md transition-all duration-200">
              <div className="text-2xl mb-2">💧</div>
              <div className="text-gray-900 font-medium mb-2">Watering</div>
              <div className="text-gray-600 text-sm">Water plants in the morning to avoid evaporation</div>
            </div>
            <div className="text-center p-4 bg-white border border-yellow-200 rounded-lg hover:shadow-md transition-all duration-200">
              <div className="text-2xl mb-2">☀️</div>
              <div className="text-gray-900 font-medium mb-2">Sun Protection</div>
              <div className="text-gray-600 text-sm">Provide shade for sensitive plants during peak hours</div>
            </div>
            <div className="text-center p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-all duration-200">
              <div className="text-2xl mb-2">🌪️</div>
              <div className="text-gray-900 font-medium mb-2">Wind Protection</div>
              <div className="text-gray-600 text-sm">Secure any loose garden items and protect tall plants</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>🔄</span>
                <span>Refresh Weather</span>
              </span>
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Weather App</span>
              </span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>📊</span>
                <span>Weather History</span>
              </span>
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="flex items-center justify-center space-x-2">
                <span>⚙️</span>
                <span>Weather Settings</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 