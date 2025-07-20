'use client'
import { useState, useEffect } from 'react'

export default function SensorsPage() {
  const [sensors, setSensors] = useState([])
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const mockSensors = [
      {
        id: 1,
        name: 'Soil Moisture Sensor 1',
        type: 'Moisture',
        model: 'SMS-2000',
        status: 'online',
        value: '72%',
        unit: '%',
        location: 'Garden Bed A',
        lastReading: '2024-07-20T12:30:00',
        battery: 85,
        signal: 'Strong',
        threshold: { min: 30, max: 80 },
        calibration: '2024-07-15'
      },
      {
        id: 2,
        name: 'Temperature Sensor 1',
        type: 'Temperature',
        model: 'TEMP-100',
        status: 'online',
        value: '24°C',
        unit: '°C',
        location: 'Garden Bed A',
        lastReading: '2024-07-20T12:30:00',
        battery: 92,
        signal: 'Strong',
        threshold: { min: 15, max: 35 },
        calibration: '2024-07-10'
      },
      {
        id: 3,
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        model: 'HUM-150',
        status: 'online',
        value: '65%',
        unit: '%',
        location: 'Garden Bed A',
        lastReading: '2024-07-20T12:30:00',
        battery: 78,
        signal: 'Medium',
        threshold: { min: 40, max: 80 },
        calibration: '2024-07-12'
      },
      {
        id: 4,
        name: 'Light Sensor 1',
        type: 'Light',
        model: 'LUX-300',
        status: 'offline',
        value: 'N/A',
        unit: 'lux',
        location: 'Garden Bed B',
        lastReading: '2024-07-20T10:15:00',
        battery: 15,
        signal: 'Weak',
        threshold: { min: 1000, max: 50000 },
        calibration: '2024-07-08'
      },
      {
        id: 5,
        name: 'pH Sensor 1',
        type: 'pH',
        model: 'PH-250',
        status: 'online',
        value: '6.8',
        unit: 'pH',
        location: 'Garden Bed A',
        lastReading: '2024-07-20T12:30:00',
        battery: 88,
        signal: 'Strong',
        threshold: { min: 6.0, max: 7.5 },
        calibration: '2024-07-18'
      }
    ]
    setSensors(mockSensors)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'status-online'
      case 'offline': return 'status-offline'
      case 'warning': return 'status-warning'
      default: return 'status-offline'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢'
      case 'offline': return '🔴'
      case 'warning': return '🟡'
      default: return '⚪'
    }
  }

  const getBatteryColor = (battery) => {
    if (battery >= 80) return 'status-online'
    if (battery >= 40) return 'status-warning'
    return 'status-offline'
  }

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'Strong': return '📶'
      case 'Medium': return '📶'
      case 'Weak': return '📶'
      default: return '📶'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card mb-6 animate-fade-in">
        <div className="card-header">
          <div>
            <h1 className="text-large mb-2 text-primary">
              IoT Sensors 📡
            </h1>
            <p className="text-secondary">
              Monitor and manage your garden IoT sensors
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Sensor
          </button>
        </div>
      </div>

      {/* Sensor Stats */}
      <div className="stats-grid">
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.1s' }}>
          <h3 className="stats-label">Total Sensors</h3>
          <p className="stats-number">{sensors.length}</p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.2s' }}>
          <h3 className="stats-label">Online</h3>
          <p className="stats-number">
            {sensors.filter(s => s.status === 'online').length}
          </p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.3s' }}>
          <h3 className="stats-label">Offline</h3>
          <p className="stats-number">
            {sensors.filter(s => s.status === 'offline').length}
          </p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.4s' }}>
          <h3 className="stats-label">Avg Battery</h3>
          <p className="stats-number">
            {Math.round(sensors.reduce((acc, sensor) => acc + sensor.battery, 0) / sensors.length)}%
          </p>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-2">
        {sensors.map((sensor, index) => (
          <div 
            key={sensor.id} 
            className="sensor-card animate-fade-in hover-lift"
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
          >
            <div className="sensor-header">
              <h3 className="sensor-name">{sensor.name}</h3>
              <span className="sensor-status">{getStatusIcon(sensor.status)}</span>
            </div>
            
            <div className="card-content">
              <div className="sensor-info">
                <div className="plant-info-item">
                  <p className="plant-info-label">Type</p>
                  <p className="plant-info-value">{sensor.type}</p>
                </div>
                <div className="plant-info-item">
                  <p className="plant-info-label">Status</p>
                  <p className={`plant-info-value ${getStatusColor(sensor.status)}`}>{sensor.status}</p>
                </div>
                <div className="plant-info-item">
                  <p className="plant-info-label">Battery</p>
                  <p className={`plant-info-value ${getBatteryColor(sensor.battery)}`}>{sensor.battery}%</p>
                </div>
                <div className="plant-info-item">
                  <p className="plant-info-label">Location</p>
                  <p className="plant-info-value">{sensor.location}</p>
                </div>
              </div>

              <div className="sensor-reading">
                <p className="sensor-value">
                  {sensor.value}
                </p>
                <p className="sensor-updated">
                  Updated: {formatTime(sensor.lastReading)}
                </p>
              </div>

              <div className="sensor-health">
                <h4 className="text-primary mb-2">Sensor Health</h4>
                <div className="sensor-health-grid">
                  <div className="plant-info-item">
                    <p className="plant-info-label">Signal</p>
                    <p className="plant-info-value">
                      {getSignalIcon(sensor.signal)} {sensor.signal}
                    </p>
                  </div>
                  <div className="plant-info-item">
                    <p className="plant-info-label">Calibrated</p>
                    <p className="plant-info-value">{formatDate(sensor.calibration)}</p>
                  </div>
                </div>
              </div>

              <div className="sensor-thresholds">
                <h4 className="text-primary mb-2">Thresholds</h4>
                <p className="sensor-threshold-text">
                  Min: {sensor.threshold.min} | Max: {sensor.threshold.max}
                </p>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn btn-primary btn-sm">Calibrate</button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedSensor(sensor)}
              >
                Configure
              </button>
              <button className="btn btn-secondary btn-sm">History</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sensor Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <div className="card-header">
              <h2 className="modal-title">Add New Sensor</h2>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddForm(false)}
              >
                Close
              </button>
            </div>
            <form className="modal-form">
              <div className="form-group">
                <label className="form-label">
                  Sensor Name
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Enter sensor name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Sensor Type
                </label>
                <select className="form-select">
                  <option>Moisture</option>
                  <option>Temperature</option>
                  <option>Humidity</option>
                  <option>Light</option>
                  <option>pH</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Location
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g., Garden Bed A"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 