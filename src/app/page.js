'use client'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [plants, setPlants] = useState([])
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockPlants = [
      {
        id: 1,
        name: 'Tomato Plant',
        type: 'Vegetable',
        health: 85,
        moisture: 72,
        temperature: 24,
        lastWatered: '2 hours ago',
        status: 'healthy'
      },
      {
        id: 2,
        name: 'Basil',
        type: 'Herb',
        health: 92,
        moisture: 68,
        temperature: 22,
        lastWatered: '1 hour ago',
        status: 'healthy'
      },
      {
        id: 3,
        name: 'Lettuce',
        type: 'Leafy Green',
        health: 78,
        moisture: 45,
        temperature: 26,
        lastWatered: '4 hours ago',
        status: 'needs-water'
      }
    ]

    const mockSensors = [
      { id: 1, name: 'Soil Moisture Sensor 1', status: 'online', value: '72%', location: 'Garden Bed A' },
      { id: 2, name: 'Temperature Sensor 1', status: 'online', value: '24°C', location: 'Garden Bed A' },
      { id: 3, name: 'Humidity Sensor 1', status: 'online', value: '65%', location: 'Garden Bed A' },
      { id: 4, name: 'Light Sensor 1', status: 'offline', value: 'N/A', location: 'Garden Bed B' }
    ]

    setTimeout(() => {
      setPlants(mockPlants)
      setSensors(mockSensors)
      setLoading(false)
    }, 1000)
  }, [])

  const getHealthColor = (health) => {
    if (health >= 80) return 'status-online'
    if (health >= 60) return 'status-warning'
    return 'status-offline'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢'
      case 'offline': return '🔴'
      case 'needs-water': return '💧'
      case 'healthy': return '🌱'
      default: return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card animate-fade-in">
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Welcome Section */}
      <div className="card mb-6 animate-fade-in">
        <h1 className="text-large mb-2 text-primary">
          Welcome to Your Smart Garden 🌱
        </h1>
        <p className="text-secondary text-small">
          Monitor your plants, track sensor data, and automate your garden care
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.1s' }}>
          <h3 className="stats-label">Total Plants</h3>
          <p className="stats-number">{plants.length}</p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.2s' }}>
          <h3 className="stats-label">Active Sensors</h3>
          <p className="stats-number">
            {sensors.filter(s => s.status === 'online').length}
          </p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.3s' }}>
          <h3 className="stats-label">Average Health</h3>
          <p className="stats-number">
            {Math.round(plants.reduce((acc, plant) => acc + plant.health, 0) / plants.length)}%
          </p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.4s' }}>
          <h3 className="stats-label">Water Needed</h3>
          <p className="stats-number">
            {plants.filter(p => p.status === 'needs-water').length}
          </p>
        </div>
      </div>

      {/* Plants Overview */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="card-title mb-4">Your Plants</h2>
        <div className="grid grid-3">
          {plants.map((plant, index) => (
            <div 
              key={plant.id} 
              className="plant-card animate-fade-in hover-lift"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="plant-header">
                <h3 className="plant-name">{plant.name}</h3>
                <span className="plant-status">{getStatusIcon(plant.status)}</span>
              </div>
              
              <div className="card-content">
                <div className="plant-info">
                  <div className="plant-info-item">
                    <p className="plant-info-label">Type</p>
                    <p className="plant-info-value">{plant.type}</p>
                  </div>
                  <div className="plant-info-item">
                    <p className="plant-info-label">Health</p>
                    <p className={`plant-info-value ${getHealthColor(plant.health)}`}>{plant.health}%</p>
                  </div>
                  <div className="plant-info-item">
                    <p className="plant-info-label">Moisture</p>
                    <p className="plant-info-value">{plant.moisture}%</p>
                  </div>
                  <div className="plant-info-item">
                    <p className="plant-info-label">Temp</p>
                    <p className="plant-info-value">{plant.temperature}°C</p>
                  </div>
                </div>
                <div className="plant-schedule">
                  <p className="plant-schedule-item">
                    Last Watered: <span className="text-primary">{plant.lastWatered}</span>
                  </p>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-primary btn-sm">Water</button>
                <button className="btn btn-secondary btn-sm">Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Status */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <h2 className="card-title mb-4">Sensor Status</h2>
        <div className="grid grid-4">
          {sensors.map((sensor, index) => (
            <div 
              key={sensor.id} 
              className="sensor-card animate-fade-in hover-lift"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              <div className="sensor-header">
                <span className="sensor-status">{getStatusIcon(sensor.status)}</span>
                <span className={sensor.status === 'online' ? 'status-online' : 'status-offline'}>
                  {sensor.status}
                </span>
              </div>
              <h4 className="sensor-name">{sensor.name}</h4>
              <p className="text-secondary text-small mb-2">
                Value: <span className="text-primary">{sensor.value}</span>
              </p>
              <p className="text-secondary text-xs">
                {sensor.location}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <h2 className="card-title mb-4">Quick Actions</h2>
        <div className="card-actions">
          <button className="btn btn-primary hover-glow">Water All Plants</button>
          <button className="btn btn-secondary hover-lift">Check Sensors</button>
          <button className="btn btn-secondary hover-lift">View Analytics</button>
          <button className="btn btn-secondary hover-lift">Add Plant</button>
        </div>
      </div>
    </div>
  )
}
