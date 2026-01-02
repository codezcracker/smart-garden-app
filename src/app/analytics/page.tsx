'use client';

import { useState, useEffect } from 'react';
import '../analytics.css';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlants: 0,
    growthRate: 0,
    waterUsage: 0,
    healthScore: 0
  });
  const [growthData, setGrowthData] = useState([]);
  const [plantHealthData, setPlantHealthData] = useState([]);
  const [waterUsageData, setWaterUsageData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`/api/analytics/data?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
        setGrowthData(data.growthData || []);
        setPlantHealthData(data.plantHealthData || []);
        setWaterUsageData(data.waterUsageData || []);
        setRecentActivity(data.recentActivity || []);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

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
              <p className="stat-value">{stats.totalPlants}</p>
              <p className="stat-change">Active devices</p>
            </div>
            <div className="stat-icon green">🌱</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Growth Rate</p>
              <p className="stat-value">{stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%</p>
              <p className="stat-change">vs last month</p>
            </div>
            <div className="stat-icon blue">📈</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Water Usage</p>
              <p className="stat-value">{stats.waterUsage}L</p>
              <p className="stat-change">This week</p>
            </div>
            <div className="stat-icon blue">💧</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Health Score</p>
              <p className="stat-value">{stats.healthScore}%</p>
              <p className="stat-change">{stats.healthScore >= 80 ? 'Excellent' : stats.healthScore >= 60 ? 'Good' : 'Needs Attention'}</p>
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
            {waterUsageData.length > 0 ? (
              waterUsageData.map((data, index) => {
                const maxUsage = Math.max(...waterUsageData.map(d => d.usage), 1);
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="water-label">{data.day}</div>
                    <div 
                      className="water-bar"
                      style={{ height: `${(data.usage / maxUsage) * 160}px` }}
                    ></div>
                    <div className="water-value">{data.usage}L</div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No water usage data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-grid">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => {
              let icon = '🌱';
              let iconClass = 'green';
              if (activity.type === 'Health Alert') {
                icon = '⚠️';
                iconClass = 'orange';
              } else if (activity.description.includes('water')) {
                icon = '💧';
                iconClass = 'blue';
              }

              return (
                <div key={index} className="activity-card">
                  <div className="activity-content">
                    <div className={`activity-icon ${iconClass}`}>{icon}</div>
                    <div className="activity-info">
                      <h4 className="activity-title">{activity.type}</h4>
                      <p className="activity-description">{activity.description}</p>
                      <p className="activity-time">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', gridColumn: '1 / -1' }}>
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 