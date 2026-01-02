'use client';

import { useState, useEffect } from 'react';
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

  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchDevices();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('/api/automation/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.automationSettings) {
          setAutomationSettings(data.automationSettings);
        }
        if (data.notificationSettings) {
          setNotificationSettings(data.notificationSettings);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/iot/user-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);

        // Get sensor status from devices
        const sensorStatus = [];
        data.devices?.forEach(device => {
          if (device.latestData?.sensors) {
            const s = device.latestData.sensors;
            if (s.soilMoisture !== undefined) {
              sensorStatus.push({
                id: `moisture-${device.deviceId}`,
                name: 'Soil Moisture Sensor',
                status: device.status === 'online' ? 'online' : 'offline',
                value: `${Math.round(s.soilMoisture)}%`,
                icon: '💧'
              });
            }
            if (s.temperature !== undefined) {
              sensorStatus.push({
                id: `temp-${device.deviceId}`,
                name: 'Temperature Sensor',
                status: device.status === 'online' ? 'online' : 'offline',
                value: `${Math.round(s.temperature)}°C`,
                icon: '🌡️'
              });
            }
            if (s.humidity !== undefined) {
              sensorStatus.push({
                id: `humidity-${device.deviceId}`,
                name: 'Humidity Sensor',
                status: device.status === 'online' ? 'online' : 'offline',
                value: `${Math.round(s.humidity)}%`,
                icon: '💨'
              });
            }
            if (s.lightLevel !== undefined) {
              sensorStatus.push({
                id: `light-${device.deviceId}`,
                name: 'Light Sensor',
                status: device.status === 'online' ? 'online' : 'offline',
                value: `${Math.round(s.lightLevel)}%`,
                icon: '☀️'
              });
            }
          }
        });
        setSensors(sensorStatus);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const saveSettings = async (settingsType, settings) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      
      const payload = {};
      if (settingsType === 'automation') {
        payload.automationSettings = settings;
      } else {
        payload.notificationSettings = settings;
      }

      const response = await fetch('/api/automation/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Settings saved successfully');
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (setting: keyof typeof automationSettings) => {
    const newSettings = {
      ...automationSettings,
      [setting]: !automationSettings[setting]
    };
    setAutomationSettings(newSettings);
    saveSettings('automation', newSettings);
  };

  const toggleNotification = (notification: keyof typeof notificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [notification]: !notificationSettings[notification]
    };
    setNotificationSettings(newSettings);
    saveSettings('notification', newSettings);
  };

  if (loading) {
    return (
      <div className="automation-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner"></div>
          <p>Loading automation settings...</p>
        </div>
      </div>
    );
  }

  const systemStatus = [
    { label: 'System Status', value: 'online', status: 'online' },
    { label: 'Database Connection', value: 'connected', status: 'online' },
    { label: 'API Services', value: 'operational', status: 'online' },
    { label: 'Active Devices', value: `${devices.filter(d => d.status === 'online').length} of ${devices.length}`, status: devices.length > 0 ? 'online' : 'warning' }
  ];

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
            {devices.length > 0 ? (
              devices.map((device) => (
                <div key={device.deviceId} className="schedule-item">
                  <div className="schedule-info">
                    <div className="schedule-icon">🌱</div>
                    <div className="schedule-details">
                      <div className="schedule-plant">{device.deviceName}</div>
                      <div className="schedule-time">{device.location || 'Garden'}</div>
                    </div>
                  </div>
                  <div className={`schedule-status ${device.status === 'online' ? 'active' : 'pending'}`}>
                    {device.status === 'online' ? 'Active' : 'Offline'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No devices configured
              </div>
            )}
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
            {sensors.length > 0 ? (
              sensors.map((sensor) => (
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
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', gridColumn: '1 / -1' }}>
                No sensor data available
              </div>
            )}
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