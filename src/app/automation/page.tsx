'use client';

import { useState } from 'react';
import '../automation.css';

export default function AutomationPage() {
  const [automationSettings, setAutomationSettings] = useState({
    autoWatering: true,
    smartLighting: true,
    climateControl: false,
    notifications: true,
    dataSync: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    wateringReminders: true,
    healthAlerts: true,
    growthUpdates: false,
    systemStatus: true
  });

  const wateringSchedule = [
    {
      id: 1,
      plant: 'Bird of Paradise',
      time: '09:00 AM',
      status: 'active',
      icon: '🌿'
    },
    {
      id: 2,
      plant: 'Monstera Deliciosa',
      time: '10:30 AM',
      status: 'pending',
      icon: '🌱'
    },
    {
      id: 3,
      plant: 'Snake Plant',
      time: '02:00 PM',
      status: 'active',
      icon: '🌵'
    }
  ];

  const sensors = [
    {
      id: 1,
      name: 'Soil Moisture Sensor',
      status: 'online',
      value: '65%',
      icon: '💧'
    },
    {
      id: 2,
      name: 'Temperature Sensor',
      status: 'online',
      value: '22°C',
      icon: '🌡️'
    },
    {
      id: 3,
      name: 'Humidity Sensor',
      status: 'warning',
      value: '45%',
      icon: '💨'
    },
    {
      id: 4,
      name: 'Light Sensor',
      status: 'offline',
      value: 'N/A',
      icon: '☀️'
    }
  ];

  const systemStatus = [
    { label: 'System Status', value: 'online', status: 'online' },
    { label: 'Database Connection', value: 'connected', status: 'online' },
    { label: 'API Services', value: 'operational', status: 'online' },
    { label: 'Backup System', value: 'last backup 2h ago', status: 'warning' }
  ];

  const toggleSetting = (setting: keyof typeof automationSettings) => {
    setAutomationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const toggleNotification = (notification: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [notification]: !prev[notification]
    }));
  };

  return (
    <div className="automation-container">
      <div className="automation-header">
        <h1 className="automation-title">Automation & Settings</h1>
        <p className="automation-subtitle">Configure your smart garden automation and preferences</p>
      </div>

      <div className="settings-grid">
        {/* Automation Controls */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon green">⚙️</div>
            <div>
              <h3 className="settings-card-title">Automation Controls</h3>
              <p className="settings-card-subtitle">Smart garden automation settings</p>
            </div>
          </div>
          
          <div className="automation-controls">
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">Auto Watering</div>
                <div className="control-description">Automatically water plants based on soil moisture</div>
              </div>
              <div 
                className={`control-toggle ${automationSettings.autoWatering ? 'active' : ''}`}
                onClick={() => toggleSetting('autoWatering')}
              ></div>
            </div>
            
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">Smart Lighting</div>
                <div className="control-description">Adjust lighting based on plant needs</div>
              </div>
              <div 
                className={`control-toggle ${automationSettings.smartLighting ? 'active' : ''}`}
                onClick={() => toggleSetting('smartLighting')}
              ></div>
            </div>
            
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">Climate Control</div>
                <div className="control-description">Maintain optimal temperature and humidity</div>
              </div>
              <div 
                className={`control-toggle ${automationSettings.climateControl ? 'active' : ''}`}
                onClick={() => toggleSetting('climateControl')}
              ></div>
            </div>
            
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">Data Sync</div>
                <div className="control-description">Sync data with cloud services</div>
              </div>
              <div 
                className={`control-toggle ${automationSettings.dataSync ? 'active' : ''}`}
                onClick={() => toggleSetting('dataSync')}
              ></div>
            </div>
          </div>
        </div>

        {/* Watering Schedule */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon blue">💧</div>
            <div>
              <h3 className="settings-card-title">Watering Schedule</h3>
              <p className="settings-card-subtitle">Automated watering schedule</p>
            </div>
          </div>
          
          <div className="watering-schedule">
            {wateringSchedule.map((schedule) => (
              <div key={schedule.id} className="schedule-item">
                <div className="schedule-info">
                  <div className="schedule-icon">{schedule.icon}</div>
                  <div className="schedule-details">
                    <div className="schedule-plant">{schedule.plant}</div>
                    <div className="schedule-time">{schedule.time}</div>
                  </div>
                </div>
                <div className={`schedule-status ${schedule.status}`}>
                  {schedule.status === 'active' ? 'Active' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor Status */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon purple">📡</div>
            <div>
              <h3 className="settings-card-title">Sensor Status</h3>
              <p className="settings-card-subtitle">Real-time sensor monitoring</p>
            </div>
          </div>
          
          <div className="sensor-grid">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="sensor-item">
                <div className={`sensor-icon ${sensor.status}`}>
                  {sensor.icon}
                </div>
                <div className="sensor-info">
                  <div className="sensor-name">{sensor.name}</div>
                  <div className="sensor-status">{sensor.status}</div>
                </div>
                <div className="sensor-value">{sensor.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon orange">🔔</div>
            <div>
              <h3 className="settings-card-title">Notifications</h3>
              <p className="settings-card-subtitle">Manage notification preferences</p>
            </div>
          </div>
          
          <div className="notification-settings">
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-label">Watering Reminders</div>
                <div className="notification-description">Get notified when plants need water</div>
              </div>
              <div 
                className={`notification-toggle ${notificationSettings.wateringReminders ? 'active' : ''}`}
                onClick={() => toggleNotification('wateringReminders')}
              ></div>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-label">Health Alerts</div>
                <div className="notification-description">Receive alerts for plant health issues</div>
              </div>
              <div 
                className={`notification-toggle ${notificationSettings.healthAlerts ? 'active' : ''}`}
                onClick={() => toggleNotification('healthAlerts')}
              ></div>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-label">Growth Updates</div>
                <div className="notification-description">Weekly growth progress reports</div>
              </div>
              <div 
                className={`notification-toggle ${notificationSettings.growthUpdates ? 'active' : ''}`}
                onClick={() => toggleNotification('growthUpdates')}
              ></div>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-label">System Status</div>
                <div className="notification-description">System maintenance and updates</div>
              </div>
              <div 
                className={`notification-toggle ${notificationSettings.systemStatus ? 'active' : ''}`}
                onClick={() => toggleNotification('systemStatus')}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon green">🖥️</div>
          <div>
            <h3 className="settings-card-title">System Status</h3>
            <p className="settings-card-subtitle">Current system health and status</p>
          </div>
        </div>
        
        <div className="system-status">
          {systemStatus.map((status, index) => (
            <div key={index} className="status-item">
              <div className="status-label">{status.label}</div>
              <div className={`status-value ${status.status}`}>{status.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 