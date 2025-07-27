import Navigation from '@/components/Navigation';

export default function Automation() {
  const automationSystems = [
    {
      id: 1,
      name: 'Watering System',
      status: 'ON',
      icon: '💧',
      description: 'Automated irrigation system',
      nextAction: '2:30 PM',
      schedule: '6 AM - 8 PM',
      efficiency: 95,
      lastRun: '2 hours ago'
    },
    {
      id: 2,
      name: 'Grow Lights',
      status: 'OFF',
      icon: '💡',
      description: 'LED grow light system',
      nextAction: '6:00 AM',
      schedule: '6 AM - 8 PM',
      efficiency: 88,
      lastRun: '8 hours ago'
    },
    {
      id: 3,
      name: 'Ventilation Fans',
      status: 'ON',
      icon: '🌪️',
      description: 'Climate control system',
      nextAction: 'Continuous',
      schedule: '24/7',
      efficiency: 92,
      lastRun: 'Active'
    },
    {
      id: 4,
      name: 'Fertilizer System',
      status: 'OFF',
      icon: '🌱',
      description: 'Automated nutrient delivery',
      nextAction: 'Tomorrow 9 AM',
      schedule: 'Weekly',
      efficiency: 78,
      lastRun: '6 days ago'
    },
    {
      id: 5,
      name: 'Pest Control',
      status: 'ON',
      icon: '🛡️',
      description: 'Automated pest monitoring',
      nextAction: 'Continuous',
      schedule: '24/7',
      efficiency: 96,
      lastRun: 'Active'
    },
    {
      id: 6,
      name: 'Climate Control',
      status: 'ON',
      icon: '🌡️',
      description: 'Temperature & humidity control',
      nextAction: 'Continuous',
      schedule: '24/7',
      efficiency: 94,
      lastRun: 'Active'
    }
  ];

  const schedules = [
    {
      id: 1,
      name: 'Morning Routine',
      time: '6:00 AM',
      actions: ['Turn on grow lights', 'Start ventilation', 'Check sensors'],
      status: 'Active'
    },
    {
      id: 2,
      name: 'Midday Check',
      time: '12:00 PM',
      actions: ['Water plants', 'Adjust climate', 'Monitor growth'],
      status: 'Active'
    },
    {
      id: 3,
      name: 'Evening Routine',
      time: '8:00 PM',
      actions: ['Turn off grow lights', 'Reduce ventilation', 'Night mode'],
      status: 'Active'
    },
    {
      id: 4,
      name: 'Weekly Maintenance',
      time: 'Sunday 9:00 AM',
      actions: ['Fertilize plants', 'Deep cleaning', 'System check'],
      status: 'Scheduled'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'ON' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBg = (status: string) => {
    return status === 'ON' ? 'bg-green-600' : 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">⚙️ Automation</h1>
          <p className="text-gray-400">Control and monitor your automated garden systems</p>
        </div>

        {/* Automation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <p className="text-gray-400 text-sm">Total Systems</p>
                <p className="text-white text-2xl font-bold">{automationSystems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🟢</span>
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-green-400 text-2xl font-bold">
                  {automationSystems.filter(s => s.status === 'ON').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📈</span>
              <div>
                <p className="text-gray-400 text-sm">Avg Efficiency</p>
                <p className="text-blue-400 text-2xl font-bold">
                  {Math.round(automationSystems.reduce((acc, s) => acc + s.efficiency, 0) / automationSystems.length)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏰</span>
              <div>
                <p className="text-gray-400 text-sm">Schedules</p>
                <p className="text-yellow-400 text-2xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {automationSystems.map((system) => (
            <div key={system.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{system.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{system.name}</h3>
                    <p className="text-gray-400 text-sm">{system.description}</p>
                  </div>
                </div>
                <button className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(system.status)} text-white`}>
                  {system.status}
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Next Action</span>
                  <span className="text-white text-sm">{system.nextAction}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Schedule</span>
                  <span className="text-gray-400 text-sm">{system.schedule}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Efficiency</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${system.efficiency}%` }}
                      ></div>
                    </div>
                    <span className="text-green-400 text-sm">{system.efficiency}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Last Run</span>
                  <span className="text-gray-400 text-sm">{system.lastRun}</span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    ⚙️ Settings
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    📊 History
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📅 Automation Schedules</h3>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{schedule.name}</h4>
                      <span className="text-gray-400 text-sm">{schedule.time}</span>
                    </div>
                    <div className="space-y-1">
                      {schedule.actions.map((action, index) => (
                        <p key={index} className="text-gray-300 text-sm">• {action}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 System Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Water Usage</span>
                <span className="text-green-400">15 gallons/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Energy Consumption</span>
                <span className="text-blue-400">3.2 kWh/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Cost Savings</span>
                <span className="text-yellow-400">$45/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Uptime</span>
                <span className="text-green-400">99.8%</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                  🟢 Start All
                </button>
                <button className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors">
                  🔴 Stop All
                </button>
                <button className="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                  ⚙️ Settings
                </button>
                <button className="bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors">
                  📊 Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              ⚡ Emergency Override
            </button>
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📅 Manage Schedules
            </button>
            <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              📊 Performance Report
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              🔧 Maintenance Mode
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 