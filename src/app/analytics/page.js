'use client'
import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('moisture')

  // Mock data for charts
  const mockData = {
    moisture: [
      { date: '2024-07-14', value: 65, plant: 'Tomato' },
      { date: '2024-07-15', value: 68, plant: 'Tomato' },
      { date: '2024-07-16', value: 72, plant: 'Tomato' },
      { date: '2024-07-17', value: 70, plant: 'Tomato' },
      { date: '2024-07-18', value: 75, plant: 'Tomato' },
      { date: '2024-07-19', value: 78, plant: 'Tomato' },
      { date: '2024-07-20', value: 72, plant: 'Tomato' }
    ],
    temperature: [
      { date: '2024-07-14', value: 22, plant: 'All Plants' },
      { date: '2024-07-15', value: 24, plant: 'All Plants' },
      { date: '2024-07-16', value: 26, plant: 'All Plants' },
      { date: '2024-07-17', value: 25, plant: 'All Plants' },
      { date: '2024-07-18', value: 28, plant: 'All Plants' },
      { date: '2024-07-19', value: 30, plant: 'All Plants' },
      { date: '2024-07-20', value: 24, plant: 'All Plants' }
    ],
    health: [
      { date: '2024-07-14', value: 82, plant: 'All Plants' },
      { date: '2024-07-15', value: 84, plant: 'All Plants' },
      { date: '2024-07-16', value: 86, plant: 'All Plants' },
      { date: '2024-07-17', value: 85, plant: 'All Plants' },
      { date: '2024-07-18', value: 87, plant: 'All Plants' },
      { date: '2024-07-19', value: 89, plant: 'All Plants' },
      { date: '2024-07-20', value: 85, plant: 'All Plants' }
    ]
  }

  const insights = [
    {
      type: 'positive',
      title: 'Water Usage Optimized',
      description: 'Automated watering reduced water consumption by 25% this week',
      icon: '💧'
    },
    {
      type: 'warning',
      title: 'Temperature Alert',
      description: 'Peak temperatures exceeded optimal range for 3 hours yesterday',
      icon: '🌡️'
    },
    {
      type: 'positive',
      title: 'Plant Health Improving',
      description: 'Average plant health increased by 3% over the last 7 days',
      icon: '🌱'
    },
    {
      type: 'info',
      title: 'Harvest Prediction',
      description: 'Tomatoes expected to be ready for harvest in 5-7 days',
      icon: '🍅'
    }
  ]

  const getMetricData = () => {
    return mockData[selectedMetric] || []
  }

  const getAverageValue = () => {
    const data = getMetricData()
    if (data.length === 0) return 0
    return Math.round(data.reduce((acc, item) => acc + item.value, 0) / data.length)
  }

  const getTrend = () => {
    const data = getMetricData()
    if (data.length < 2) return 'stable'
    const first = data[0].value
    const last = data[data.length - 1].value
    if (last > first + 2) return 'up'
    if (last < first - 2) return 'down'
    return 'stable'
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'status-online'
      case 'down': return 'status-offline'
      default: return 'status-warning'
    }
  }

  const renderSimpleChart = () => {
    const data = getMetricData()
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    
    return (
      <div className="analytics-chart">
        {data.map((item, index) => {
          const height = ((item.value - minValue) / (maxValue - minValue)) * 100
          return (
            <div key={index} className="analytics-bar" style={{ height: `${height}%` }}>
              <div className="analytics-bar-label">
                {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card mb-6 animate-fade-in">
        <div className="analytics-header">
          <div>
            <h1 className="text-large mb-2 text-primary">
              Garden Analytics 📊
            </h1>
            <p className="text-secondary">
              Track performance and gain insights from your garden data
            </p>
          </div>
          <div className="analytics-controls">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="analytics-select"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.1s' }}>
          <h3 className="stats-label">Avg Moisture</h3>
          <p className="stats-number">72%</p>
          <p className="stats-trend">📈 +3% from last week</p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.2s' }}>
          <h3 className="stats-label">Avg Temperature</h3>
          <p className="stats-number">24°C</p>
          <p className="stats-trend">➡️ Stable</p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.3s' }}>
          <h3 className="stats-label">Plant Health</h3>
          <p className="stats-number">85%</p>
          <p className="stats-trend">📈 +3% from last week</p>
        </div>
        <div className="stats-card animate-fade-in hover-lift" style={{ animationDelay: '0.4s' }}>
          <h3 className="stats-label">Water Saved</h3>
          <p className="stats-number">25%</p>
          <p className="stats-trend">vs manual watering</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="analytics-header">
          <h2 className="analytics-title">Trend Analysis</h2>
          <div className="analytics-controls">
            {['moisture', 'temperature', 'health'].map(metric => (
              <button
                key={metric}
                className={`btn btn-sm ${selectedMetric === metric ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedMetric(metric)}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="analytics-trend">
            <div className="analytics-trend-info">
              <h3 className="text-primary mb-1">
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
              </h3>
              <p className="analytics-trend-average">
                Average: {getAverageValue()}{selectedMetric === 'temperature' ? '°C' : selectedMetric === 'moisture' ? '%' : '%'}
              </p>
            </div>
            <div className="analytics-trend-indicator">
              <p className="analytics-trend-icon">
                {getTrendIcon(getTrend())}
              </p>
              <p className={`analytics-trend-text ${getTrendColor(getTrend())}`}>
                {getTrend() === 'up' ? 'Increasing' : getTrend() === 'down' ? 'Decreasing' : 'Stable'}
              </p>
            </div>
          </div>
          {renderSimpleChart()}
        </div>
      </div>

      {/* Insights */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h2 className="card-title mb-4">AI Insights 🤖</h2>
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`insight-card ${insight.type} animate-fade-in hover-lift`}
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              <div className="insight-header">
                <span className="insight-icon">{insight.icon}</span>
                <h3 className="insight-title">{insight.title}</h3>
              </div>
              <p className="insight-description">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-grid">
        <div className="performance-card animate-fade-in hover-lift" style={{ animationDelay: '0.8s' }}>
          <h3 className="performance-title">Watering Efficiency</h3>
          <div className="performance-item">
            <div className="performance-header">
              <span className="performance-label">Optimal Timing</span>
              <span className="performance-value">92%</span>
            </div>
            <div className="performance-bar">
              <div className="performance-bar-fill" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div className="performance-item">
            <div className="performance-header">
              <span className="performance-label">Water Conservation</span>
              <span className="performance-value">25%</span>
            </div>
            <div className="performance-bar">
              <div className="performance-bar-fill" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>

        <div className="performance-card animate-fade-in hover-lift" style={{ animationDelay: '0.9s' }}>
          <h3 className="performance-title">Plant Performance</h3>
          <div className="performance-item">
            <div className="performance-header">
              <span className="performance-label">Growth Rate</span>
              <span className="performance-value">+15%</span>
            </div>
            <div className="performance-bar">
              <div className="performance-bar-fill" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="performance-item">
            <div className="performance-header">
              <span className="performance-label">Yield Prediction</span>
              <span className="performance-value">+20%</span>
            </div>
            <div className="performance-bar">
              <div className="performance-bar-fill" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 