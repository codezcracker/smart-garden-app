'use client';

import { useState } from 'react';
import '../analytics.css';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const growthData = [
    { month: 'Jan', growth: 12, plants: 8 },
    { month: 'Feb', growth: 18, plants: 10 },
    { month: 'Mar', growth: 15, plants: 12 },
    { month: 'Apr', growth: 22, plants: 14 },
    { month: 'May', growth: 28, plants: 16 },
    { month: 'Jun', growth: 35, plants: 18 },
    { month: 'Jul', growth: 42, plants: 20 },
    { month: 'Aug', growth: 38, plants: 22 },
    { month: 'Sep', growth: 45, plants: 24 },
    { month: 'Oct', growth: 52, plants: 26 },
    { month: 'Nov', growth: 48, plants: 28 },
    { month: 'Dec', growth: 55, plants: 30 }
  ];

  const plantHealthData = [
    { name: 'Excellent', count: 18, percentage: 60, color: 'excellent' },
    { name: 'Good', count: 8, percentage: 27, color: 'good' },
    { name: 'Needs Attention', count: 4, percentage: 13, color: 'warning' }
  ];

  const waterUsageData = [
    { day: 'Mon', usage: 45 },
    { day: 'Tue', usage: 52 },
    { day: 'Wed', usage: 38 },
    { day: 'Thu', usage: 61 },
    { day: 'Fri', usage: 48 },
    { day: 'Sat', usage: 55 },
    { day: 'Sun', usage: 42 }
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">Track your garden&apos;s performance and growth metrics</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Total Plants</p>
              <p className="stat-value">30</p>
              <p className="stat-change">+5 this month</p>
            </div>
            <div className="stat-icon green">🌱</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Growth Rate</p>
              <p className="stat-value">+55%</p>
              <p className="stat-change">+7% vs last month</p>
            </div>
            <div className="stat-icon blue">📈</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Water Usage</p>
              <p className="stat-value">48L</p>
              <p className="stat-change">This week</p>
            </div>
            <div className="stat-icon blue">💧</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Health Score</p>
              <p className="stat-value">87%</p>
              <p className="stat-change">Excellent</p>
            </div>
            <div className="stat-icon green">❤️</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Growth Trends</h3>
              <p className="chart-subtitle">Monthly plant growth and count</p>
            </div>
            <select 
              className="chart-dropdown"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="growth-chart-container">
            <div className="growth-chart">
              <div className="growth-point"></div>
              <div className="growth-label">+4%</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color green"></div>
                <span>Growth %</span>
              </div>
              <div className="legend-item">
                <div className="legend-color blue"></div>
                <span>Plant Count</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Health Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Plant Health Distribution</h3>
              <p className="chart-subtitle">Current health status of all plants</p>
            </div>
          </div>
          
          <div className="health-distribution">
            {plantHealthData.map((item, index) => (
              <div key={index} className="health-item">
                <div className="health-info">
                  <div className={`health-color ${item.color}`}></div>
                  <span className="health-name">{item.name}</span>
                  <span className="health-count">({item.count})</span>
                </div>
                <div className="health-progress">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Water Usage Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Weekly Water Usage</h3>
            <p className="chart-subtitle">Daily water consumption patterns</p>
          </div>
        </div>
        
        <div className="water-chart-container">
          <div className="water-chart">
            {waterUsageData.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="water-label">{data.day}</div>
                <div 
                  className="water-bar"
                  style={{ height: `${(data.usage / 61) * 160}px` }}
                ></div>
                <div className="water-value">{data.usage}L</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-content">
              <div className="activity-icon green">🌱</div>
              <div className="activity-info">
                <h4 className="activity-title">New Plant Added</h4>
                <p className="activity-description">Monstera Deliciosa</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-content">
              <div className="activity-icon blue">💧</div>
              <div className="activity-info">
                <h4 className="activity-title">Watering Complete</h4>
                <p className="activity-description">All plants watered</p>
                <p className="activity-time">4 hours ago</p>
              </div>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-content">
              <div className="activity-icon orange">⚠️</div>
              <div className="activity-info">
                <h4 className="activity-title">Health Alert</h4>
                <p className="activity-description">Snake Plant needs attention</p>
                <p className="activity-time">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 