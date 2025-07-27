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
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🌤️ Weather</h1>
          <p className="text-gray-400">Current weather conditions and forecast for your garden</p>
        </div>

        {/* Current Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg p-4 lg:p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Current Conditions</h2>
                <p className="text-gray-400 text-sm lg:text-base">Updated just now</p>
              </div>
              <div className="text-right">
                <div className="text-4xl lg:text-6xl mb-2">{currentWeather.icon}</div>
                <div className="text-gray-400 text-sm lg:text-base">{currentWeather.condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{currentWeather.temperature}°F</div>
                <div className="text-gray-400 text-xs lg:text-sm">Temperature</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1">{currentWeather.humidity}%</div>
                <div className="text-gray-400 text-xs lg:text-sm">Humidity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gray-300 mb-1">{currentWeather.wind} mph</div>
                <div className="text-gray-400 text-xs lg:text-sm">Wind Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-400 mb-1">{currentWeather.uvIndex}</div>
                <div className="text-gray-400 text-xs lg:text-sm">UV Index</div>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm lg:text-base">Feels Like</span>
                <span className="text-white text-lg lg:text-xl font-semibold">{currentWeather.feelsLike}°F</span>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">⚠️ Weather Alerts</h3>
            <div className="space-y-3 lg:space-y-4">
              {weatherAlerts.map((alert, index) => (
                <div key={index} className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">⚠️</span>
                    <div>
                      <div className="text-white font-medium text-sm">{alert.type}</div>
                      <div className="text-gray-300 text-xs mt-1">{alert.message}</div>
                      <div className="text-gray-500 text-xs mt-2">{alert.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">📅 7-Day Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-gray-300 text-sm mb-2">{day.day}</div>
                <div className="text-3xl mb-2">{day.icon}</div>
                <div className="text-white font-semibold mb-1">{day.temp}°F</div>
                <div className="text-gray-400 text-xs">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Impact on Garden */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🌱 Garden Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Watering Needs</span>
                <span className="text-green-400">Normal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Sun Exposure</span>
                <span className="text-yellow-400">High</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Frost Risk</span>
                <span className="text-green-400">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Wind Protection</span>
                <span className="text-blue-400">Recommended</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Weather Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Temperature Trend</span>
                <span className="text-green-400">↗️ Warming</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Humidity Trend</span>
                <span className="text-red-400">↘️ Decreasing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Precipitation</span>
                <span className="text-blue-400">↗️ Increasing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Growing Season</span>
                <span className="text-green-400">Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Recommendations */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">💡 Garden Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="text-2xl mb-2">💧</div>
              <div className="text-white font-medium mb-2">Watering</div>
              <div className="text-gray-300 text-sm">Water plants in the morning to avoid evaporation</div>
            </div>
            <div className="text-center p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="text-2xl mb-2">☀️</div>
              <div className="text-white font-medium mb-2">Sun Protection</div>
              <div className="text-gray-300 text-sm">Provide shade for sensitive plants during peak hours</div>
            </div>
            <div className="text-center p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="text-2xl mb-2">🌪️</div>
              <div className="text-white font-medium mb-2">Wind Protection</div>
              <div className="text-gray-300 text-sm">Secure any loose garden items and protect tall plants</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              🔄 Refresh Weather
            </button>
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              📱 Weather App
            </button>
            <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              📊 Weather History
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              ⚙️ Weather Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 