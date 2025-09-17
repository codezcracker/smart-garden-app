'use client';

import { useState, useEffect } from 'react';
import './garden-config.css';

export default function GardenConfigPage() {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGarden, setEditingGarden] = useState(null);
  const [deviceStatuses, setDeviceStatuses] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    gardenName: '',
    location: '',
    area: '',
    description: '',
    gardenType: 'Indoor',
    wifiSSID: 'Qureshi Deco',
    wifiPassword: '65327050',
    timezone: 'UTC',
    units: 'metric',
    dataRetentionDays: 30,
    tempMin: 15,
    tempMax: 35,
    humidityMin: 30,
    humidityMax: 80,
    soilMin: 20,
    soilMax: 80
  });

  useEffect(() => {
    fetchGardens();
    fetchDeviceStatuses();
    
    // Update device statuses every 5 seconds
    const interval = setInterval(fetchDeviceStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchGardens = async () => {
    try {
      setLoading(true);
      // In a real app, you would get the auth token from your auth system
      // For testing - no authentication required
      const response = await fetch('/api/iot/gardens', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.gardens) {
        setGardens(data.gardens);
        console.log('🌱 Fetched gardens:', data.gardens);
      } else {
        console.log('🌱 No gardens found or API error:', data);
        setGardens([]);
      }
    } catch (error) {
      console.error('❌ Error fetching gardens:', error);
      setGardens([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceStatuses = async () => {
    try {
      const response = await fetch('/api/iot/check-status');
      const data = await response.json();
      
      if (data.success && data.devices) {
        const statusMap = {};
        data.devices.forEach(device => {
          statusMap[device.deviceId] = {
            status: device.status,
            lastSeen: device.lastSeen,
            wifiRSSI: device.wifiRSSI,
            connectionQuality: device.connectionQuality
          };
        });
        setDeviceStatuses(statusMap);
        console.log('📱 Device statuses updated:', statusMap);
      }
    } catch (error) {
      console.error('❌ Error fetching device statuses:', error);
    }
  };

  const handleAddGarden = () => {
    setFormData({
      gardenName: '',
      location: '',
      area: '',
      description: '',
      gardenType: 'Indoor',
      wifiSSID: 'Qureshi Deco',
      wifiPassword: '65327050',
      timezone: 'UTC',
      units: 'metric',
      dataRetentionDays: 30,
      tempMin: 15,
      tempMax: 35,
      humidityMin: 30,
      humidityMax: 80,
      soilMin: 20,
      soilMax: 80
    });
    setEditingGarden(null);
    setShowAddForm(true);
  };

  const handleEditGarden = (garden) => {
    setFormData({
      gardenName: garden.gardenName,
      location: garden.location,
      area: garden.area,
      description: garden.description,
      gardenType: garden.gardenType,
      wifiSSID: garden.network.wifiSSID,
      wifiPassword: garden.network.wifiPassword,
      timezone: garden.settings.timezone,
      units: garden.settings.units,
      dataRetentionDays: garden.settings.dataRetentionDays,
      tempMin: garden.settings.alertThresholds.temperature.min,
      tempMax: garden.settings.alertThresholds.temperature.max,
      humidityMin: garden.settings.alertThresholds.humidity.min,
      humidityMax: garden.settings.alertThresholds.humidity.max,
      soilMin: garden.settings.alertThresholds.soilMoisture.min,
      soilMax: garden.settings.alertThresholds.soilMoisture.max
    });
    setEditingGarden(garden);
    setShowAddForm(true);
  };

  const handleSaveGarden = async () => {
    try {
      console.log('💾 Saving garden data:', formData);
      
      // For testing - no authentication required
      const response = await fetch('/api/iot/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('📡 API Response:', responseData);

      if (response.ok && responseData.success) {
        setShowAddForm(false);
        fetchGardens();
        alert('Garden created successfully! You can now add devices to this garden.');
      } else {
        console.error('❌ Save failed:', responseData);
        alert(`Error creating garden: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving garden:', error);
      alert('Error saving garden: ' + error.message);
    }
  };

  const handleUpdateGarden = async () => {
    try {
      console.log('💾 Updating garden data:', formData);
      
      // For testing - no authentication required
      const response = await fetch(`/api/iot/gardens/${editingGarden.gardenId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('📡 API Response:', responseData);

      if (response.ok && responseData.success) {
        setShowAddForm(false);
        fetchGardens();
        alert('Garden configuration updated successfully!');
      } else {
        console.error('❌ Update failed:', responseData);
        alert(`Error updating garden: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating garden:', error);
      alert('Error updating garden: ' + error.message);
    }
  };

  const handleDeleteGarden = async (garden) => {
    if (!confirm(`Are you sure you want to delete "${garden.gardenName}"? This will also remove all devices in this garden.`)) {
      return;
    }

    try {
      // For testing - no authentication required
      const response = await fetch(`/api/iot/gardens/${garden.gardenId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        fetchGardens();
        alert('Garden deleted successfully!');
      } else {
        console.error('❌ Delete failed:', responseData);
        alert(`Error deleting garden: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting garden:', error);
      alert('Error deleting garden: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <div className="garden-config-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your gardens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="garden-config-page">
      <div className="page-header">
        <h1>🌱 Garden Configuration</h1>
        <p>Configure your Smart Garden locations and settings</p>
      </div>

      <div className="gardens-section">
        <div className="section-header">
          <h2>Your Gardens ({gardens.length})</h2>
          <button 
            className="btn btn-primary"
            onClick={handleAddGarden}
          >
            ➕ Add Garden
          </button>
        </div>

        {gardens.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No gardens configured</h3>
            <p>Create your first garden to start adding IoT devices</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddGarden}
            >
              Create Garden
            </button>
          </div>
        ) : (
          <div className="gardens-grid">
            {gardens.map((garden) => (
              <div key={garden.gardenId} className="garden-card">
                <div className="garden-header">
                  <div className="garden-info">
                    <h3>{garden.gardenName}</h3>
                    <p className="garden-location">📍 {garden.location}</p>
                    <p className="garden-type">{garden.gardenType} Garden</p>
                  </div>
                  <div className="garden-status">
                    <span 
                      className="status-indicator"
                      style={{ color: getStatusColor(garden.status) }}
                    >
                      🟢 {garden.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="garden-details">
                  <div className="detail-item">
                    <span className="label">Area:</span>
                    <span className="value">{garden.area || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">WiFi Network:</span>
                    <span className="value">{garden.network.wifiSSID}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Devices:</span>
                    <span className="value">
                      {garden.deviceCount || 0} total 
                      ({garden.onlineDevices || 0} online)
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Device Status:</span>
                    <span className="value">
                      {garden.devices && garden.devices.length > 0 ? (
                        <div className="device-status-list">
                          {garden.devices.map((device, index) => {
                            const deviceStatus = deviceStatuses[device.deviceId];
                            const status = deviceStatus?.status || 'unknown';
                            const statusColor = status === 'online' ? '#10b981' : status === 'offline' ? '#ef4444' : '#6b7280';
                            return (
                              <span key={device.deviceId} className="device-status-item">
                                <span className="status-dot" style={{ backgroundColor: statusColor }}></span>
                                {device.deviceId}: {status.toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        'No devices'
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(garden.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="garden-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditGarden(garden)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => window.open(`/my-devices?garden=${garden.gardenId}`, '_blank')}
                  >
                    📱 Manage Devices
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteGarden(garden)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingGarden ? 'Edit Garden' : 'Add New Garden'}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <h3>🌱 Garden Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Garden Name *</label>
                    <input
                      type="text"
                      value={formData.gardenName}
                      onChange={(e) => setFormData({...formData, gardenName: e.target.value})}
                      placeholder="e.g., Living Room Garden, Balcony Garden"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Living Room, Balcony, Kitchen"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Area (sq ft)</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      placeholder="e.g., 50, 100"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Garden Type</label>
                    <select
                      value={formData.gardenType}
                      onChange={(e) => setFormData({...formData, gardenType: e.target.value})}
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Greenhouse">Greenhouse</option>
                      <option value="Hydroponic">Hydroponic</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your garden..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>📶 Network Configuration</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>WiFi Network Name (SSID) *</label>
                    <input
                      type="text"
                      value={formData.wifiSSID}
                      onChange={(e) => setFormData({...formData, wifiSSID: e.target.value})}
                      placeholder="Your WiFi network name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>WiFi Password *</label>
                    <input
                      type="password"
                      value={formData.wifiPassword}
                      onChange={(e) => setFormData({...formData, wifiPassword: e.target.value})}
                      placeholder="Your WiFi password"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>⚙️ Garden Settings</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Units</label>
                    <select
                      value={formData.units}
                      onChange={(e) => setFormData({...formData, units: e.target.value})}
                    >
                      <option value="metric">Metric (°C, cm)</option>
                      <option value="imperial">Imperial (°F, inches)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Data Retention (days)</label>
                  <input
                    type="number"
                    value={formData.dataRetentionDays}
                    onChange={(e) => setFormData({...formData, dataRetentionDays: parseInt(e.target.value)})}
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>🚨 Alert Thresholds</h3>
                
                <div className="thresholds-grid">
                  <div className="threshold-group">
                    <h4>🌡️ Temperature</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Min (°C)</label>
                        <input
                          type="number"
                          value={formData.tempMin}
                          onChange={(e) => setFormData({...formData, tempMin: parseInt(e.target.value)})}
                          placeholder="15"
                        />
                      </div>
                      <div className="form-group">
                        <label>Max (°C)</label>
                        <input
                          type="number"
                          value={formData.tempMax}
                          onChange={(e) => setFormData({...formData, tempMax: parseInt(e.target.value)})}
                          placeholder="35"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="threshold-group">
                    <h4>💧 Humidity</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Min (%)</label>
                        <input
                          type="number"
                          value={formData.humidityMin}
                          onChange={(e) => setFormData({...formData, humidityMin: parseInt(e.target.value)})}
                          placeholder="30"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="form-group">
                        <label>Max (%)</label>
                        <input
                          type="number"
                          value={formData.humidityMax}
                          onChange={(e) => setFormData({...formData, humidityMax: parseInt(e.target.value)})}
                          placeholder="80"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="threshold-group">
                    <h4>🌱 Soil Moisture</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Min (%)</label>
                        <input
                          type="number"
                          value={formData.soilMin}
                          onChange={(e) => setFormData({...formData, soilMin: parseInt(e.target.value)})}
                          placeholder="20"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="form-group">
                        <label>Max (%)</label>
                        <input
                          type="number"
                          value={formData.soilMax}
                          onChange={(e) => setFormData({...formData, soilMax: parseInt(e.target.value)})}
                          placeholder="80"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={editingGarden ? handleUpdateGarden : handleSaveGarden}
              >
                {editingGarden ? 'Update Garden' : 'Create Garden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
