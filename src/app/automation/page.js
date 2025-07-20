'use client'
import { useState, useEffect } from 'react'

export default function AutomationPage() {
  const [automations, setAutomations] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const mockAutomations = [
      {
        id: 1,
        name: 'Auto Watering - Morning',
        type: 'watering',
        status: 'active',
        schedule: 'daily',
        time: '06:00',
        conditions: [
          { sensor: 'Soil Moisture', operator: '<', value: '40%' },
          { sensor: 'Weather', operator: '!=', value: 'Rainy' }
        ],
        actions: [
          { action: 'Water Plants', duration: '5 minutes', zone: 'Garden Bed A' }
        ],
        lastTriggered: '2024-07-20T06:00:00',
        nextRun: '2024-07-21T06:00:00'
      },
      {
        id: 2,
        name: 'Temperature Control',
        type: 'climate',
        status: 'active',
        schedule: 'continuous',
        conditions: [
          { sensor: 'Temperature', operator: '>', value: '30°C' }
        ],
        actions: [
          { action: 'Activate Fans', duration: 'until temp < 28°C' },
          { action: 'Increase Shade', duration: 'continuous' }
        ],
        lastTriggered: '2024-07-20T14:30:00',
        nextRun: 'continuous'
      },
      {
        id: 3,
        name: 'Light Management',
        type: 'lighting',
        status: 'inactive',
        schedule: 'daily',
        time: '18:00',
        conditions: [
          { sensor: 'Light Level', operator: '<', value: '1000 lux' }
        ],
        actions: [
          { action: 'Turn On Grow Lights', duration: '4 hours', zone: 'Indoor Garden' }
        ],
        lastTriggered: '2024-07-19T18:00:00',
        nextRun: '2024-07-20T18:00:00'
      },
      {
        id: 4,
        name: 'Fertilizer Schedule',
        type: 'feeding',
        status: 'active',
        schedule: 'weekly',
        day: 'Sunday',
        time: '08:00',
        conditions: [
          { sensor: 'Plant Growth Stage', operator: '==', value: 'Vegetative' }
        ],
        actions: [
          { action: 'Dispense Fertilizer', amount: '50ml', zone: 'All Plants' }
        ],
        lastTriggered: '2024-07-14T08:00:00',
        nextRun: '2024-07-21T08:00:00'
      }
    ]
    setAutomations(mockAutomations)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-online'
      case 'inactive': return 'status-offline'
      case 'paused': return 'status-warning'
      default: return 'status-offline'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢'
      case 'inactive': return '🔴'
      case 'paused': return '🟡'
      default: return '⚪'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'watering': return '💧'
      case 'climate': return '🌡️'
      case 'lighting': return '💡'
      case 'feeding': return '🌱'
      default: return '⚙️'
    }
  }

  const formatDate = (dateString) => {
    if (dateString === 'continuous') return 'Continuous'
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString) => {
    if (dateString === 'continuous') return 'Continuous'
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const toggleAutomation = (id) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === 'active' ? 'inactive' : 'active' }
        : auto
    ))
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card mb-6 animate-fade-in">
        <div className="card-header">
          <div>
            <h1 className="text-large mb-2 text-primary">
              Smart Automation 🤖
            </h1>
            <p className="text-secondary">
              Configure automated garden care rules and schedules
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Create Automation
          </button>
        </div>
      </div>

      {/* Automation Stats */}
      <div className="stats-grid">
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.1s' }}>
          <h3 className="stats-label">Total Rules</h3>
          <p className="stats-number">{automations.length}</p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.2s' }}>
          <h3 className="stats-label">Active</h3>
          <p className="stats-number">
            {automations.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.3s' }}>
          <h3 className="stats-label">Inactive</h3>
          <p className="stats-number">
            {automations.filter(a => a.status === 'inactive').length}
          </p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.4s' }}>
          <h3 className="stats-label">Today's Runs</h3>
          <p className="stats-number">3</p>
        </div>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-2">
        {automations.map((automation, index) => (
          <div 
            key={automation.id} 
            className="automation-card animate-fade-in hover-lift"
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
          >
            <div className="automation-header">
              <div className="automation-title">
                <span className="automation-icon">{getTypeIcon(automation.type)}</span>
                <h3 className="automation-name">{automation.name}</h3>
              </div>
              <span className="automation-status">{getStatusIcon(automation.status)}</span>
            </div>
            
            <div className="card-content">
              <div className="automation-info">
                <div className="plant-info-item">
                  <p className="plant-info-label">Type</p>
                  <p className="plant-info-value" style={{ textTransform: 'capitalize' }}>
                    {automation.type}
                  </p>
                </div>
                <div className="plant-info-item">
                  <p className="plant-info-label">Status</p>
                  <p className={`plant-info-value ${getStatusColor(automation.status)}`}>
                    {automation.status}
                  </p>
                </div>
                <div className="plant-info-item">
                  <p className="plant-info-label">Schedule</p>
                  <p className="plant-info-value">
                    {automation.schedule} {automation.time && `at ${automation.time}`}
                  </p>
                </div>
                <div className="plant-info-item">
                  <p className="plant-info-label">Next Run</p>
                  <p className="plant-info-value">
                    {formatDate(automation.nextRun)}
                  </p>
                </div>
              </div>

              <div className="automation-conditions">
                <h4 className="text-primary mb-2">Conditions</h4>
                <div className="automation-conditions-box">
                  {automation.conditions.map((condition, index) => (
                    <p key={index} className="automation-condition-item">
                      {condition.sensor} {condition.operator} {condition.value}
                    </p>
                  ))}
                </div>
              </div>

              <div className="automation-actions">
                <h4 className="text-primary mb-2">Actions</h4>
                <div className="automation-actions-box">
                  {automation.actions.map((action, index) => (
                    <p key={index} className="automation-action-item">
                      {action.action} - {action.duration} {action.zone && `(${action.zone})`}
                    </p>
                  ))}
                </div>
              </div>

              <div className="automation-execution">
                <h4 className="text-primary mb-2">Last Execution</h4>
                <p className="automation-execution-text">
                  {formatDate(automation.lastTriggered)} at {formatTime(automation.lastTriggered)}
                </p>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className={`btn btn-sm ${automation.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => toggleAutomation(automation.id)}
              >
                {automation.status === 'active' ? 'Pause' : 'Activate'}
              </button>
              <button className="btn btn-secondary btn-sm">Edit</button>
              <button className="btn btn-secondary btn-sm">Run Now</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Automation Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="card modal-content large">
            <div className="card-header">
              <h2 className="modal-title">Create New Automation</h2>
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
                  Automation Name
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Enter automation name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Type
                </label>
                <select className="form-select">
                  <option>watering</option>
                  <option>climate</option>
                  <option>lighting</option>
                  <option>feeding</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Schedule
                </label>
                <select className="form-select">
                  <option>daily</option>
                  <option>weekly</option>
                  <option>monthly</option>
                  <option>continuous</option>
                </select>
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
                  Create Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 