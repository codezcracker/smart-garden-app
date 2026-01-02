'use client';
import { useState, useEffect } from 'react';
import './laser-control.css';

export default function LaserControlPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [laserStatus, setLaserStatus] = useState({}); // Track laser status per device
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState(false);
  const [statusPolling, setStatusPolling] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      window.location.href = '/auth/login';
      return;
    }

    fetchDevices(token);
  }, []);

  const fetchDevices = async (token) => {
    try {
      setLoading(true);
      
      // Fetch user devices
      const userDevicesResponse = await fetch('/api/iot/user-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let allDevices = [];
      
      if (userDevicesResponse.ok) {
        const data = await userDevicesResponse.json();
        if (data.success && data.devices) {
          allDevices = data.devices;
        }
      } else if (userDevicesResponse.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/login';
        return;
      }
      
      // Also fetch devices from devices collection (includes auto-registered test devices)
      try {
        const devicesResponse = await fetch('/api/devices/register', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json();
          if (devicesData.devices) {
            // Only include ESP32_Laser devices or test devices with MAC addresses
            const laserDevices = devicesData.devices.filter(device => {
              const isLaserDevice = device.deviceType === 'ESP32_Laser' || device.isTestDevice;
              const hasMac = !!device.macAddress;
              return isLaserDevice && hasMac;
            });
            
            console.log('🔍 Found laser devices:', laserDevices.map(d => ({
              name: d.deviceName,
              mac: d.macAddress,
              type: d.deviceType
            })));
            
            // Merge devices, avoiding duplicates
            const existingIds = new Set(allDevices.map(d => d._id?.toString() || d.deviceId));
            laserDevices.forEach(device => {
              const id = device._id?.toString() || device._id;
              if (!existingIds.has(id)) {
                allDevices.push({
                  ...device,
                  deviceId: device._id?.toString() || device._id,
                  _id: device._id
                });
              }
            });
          }
        }
      } catch (error) {
        console.log('Could not fetch additional devices:', error);
      }
      
      console.log('📋 Total devices found:', allDevices.length);
      console.log('📋 Devices:', allDevices.map(d => ({
        name: d.deviceName,
        id: d._id,
        deviceId: d.deviceId,
        mac: d.macAddress,
        type: d.deviceType
      })));
      
      if (allDevices.length > 0) {
        setDevices(allDevices);
        // Initialize laser status for each device
        const initialStatus = {};
        allDevices.forEach(device => {
          const id = device._id || device.deviceId;
          initialStatus[id] = false; // Default to off
        });
        setLaserStatus(initialStatus);
        
        // Auto-select first device immediately (always select first)
        const firstDevice = allDevices[0];
        const firstId = firstDevice._id?.toString() || firstDevice.deviceId || firstDevice._id;
        setSelectedDevice(firstId);
        console.log('✅ Auto-selected first device:', firstId, firstDevice.deviceName);
        
        // Fetch real laser state for all devices
        fetchLaserStates(allDevices, token);
      } else {
        console.log('⚠️ No laser devices found. Make sure ESP32 has polled the server.');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real laser state from device
  const fetchLaserStates = async (deviceList, token) => {
    try {
      setStatusPolling(true);
      const states = {};
      
      for (const device of deviceList) {
        const deviceId = device._id?.toString() || device.deviceId || device._id;
        if (!device.macAddress) continue;
        
        try {
          // Poll the device to get current state
          const response = await fetch('/api/devices/control', {
            method: 'PATCH',
            headers: {
              'x-device-key': 'default-key',
              'x-device-mac': device.macAddress,
              'x-device-id': deviceId,
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const laserState = data.laserState === 'on' || data.laserState === true;
            states[deviceId] = laserState;
            console.log(`📊 Device ${deviceId} laser state: ${laserState ? 'ON' : 'OFF'}`);
          }
        } catch (error) {
          console.error(`Error fetching state for device ${deviceId}:`, error);
        }
      }
      
      // Update states
      setLaserStatus(prev => ({ ...prev, ...states }));
    } catch (error) {
      console.error('Error fetching laser states:', error);
    } finally {
      setStatusPolling(false);
    }
  };

  // Poll for state updates periodically
  useEffect(() => {
    if (!selectedDevice || devices.length === 0) return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    // Poll every 2 seconds for state updates
    const pollInterval = setInterval(() => {
      fetchLaserStates(devices, token);
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [selectedDevice, devices]);

  const toggleLaser = async (deviceId, currentStatus, macAddress = null) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please log in to control devices');
      window.location.href = '/auth/login';
      return;
    }

    // Prevent multiple rapid clicks
    if (controlLoading) {
      console.log('⚠️ Command already in progress, ignoring duplicate click');
      return;
    }

    setControlLoading(true);
    const action = currentStatus ? 'laser_off' : 'laser_on';
    const device = getDeviceById(deviceId);

    try {
      const requestBody = {
        deviceId: deviceId,
        action: action,
        parameters: {}
      };

      // Include MAC address if available (helps with auto-registered devices)
      const macAddr = macAddress || device?.macAddress;
      if (macAddr) {
        requestBody.macAddress = macAddr;
      }

      console.log('📤 Sending command:', { 
        deviceId, 
        action, 
        macAddress: macAddr,
        device: device ? { name: device.deviceName, mac: device.macAddress, id: device._id } : 'not found'
      });

      const response = await fetch('/api/devices/control', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistically update status, but also fetch real state after a delay
        const newStatus = !currentStatus;
        setLaserStatus(prev => ({
          ...prev,
          [deviceId]: newStatus
        }));
        
        const deviceName = device?.deviceName || device?.deviceId || deviceId;
        console.log(`✅ Command sent - Laser will ${action === 'laser_on' ? 'turn ON' : 'turn OFF'} for ${deviceName}`);
        
        // Fetch real state after command execution (wait for ESP32 to process)
        setTimeout(async () => {
          const token = localStorage.getItem('auth_token');
          if (token && device) {
            try {
              const stateResponse = await fetch('/api/devices/control', {
                method: 'PATCH',
                headers: {
                  'x-device-key': 'default-key',
                  'x-device-mac': device.macAddress || macAddress || '',
                  'x-device-id': deviceId,
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (stateResponse.ok) {
                const stateData = await stateResponse.json();
                const realState = stateData.laserState === 'on' || stateData.laserState === true;
                setLaserStatus(prev => ({
                  ...prev,
                  [deviceId]: realState
                }));
                console.log(`📊 Real laser state updated: ${realState ? 'ON' : 'OFF'}`);
              }
            } catch (error) {
              console.error('Error fetching real state:', error);
            }
          }
        }, 500); // Wait 500ms for ESP32 to process command
      } else {
        console.error('❌ API Error:', {
          status: response.status,
          error: data.error,
          fullResponse: data,
          requestBody: requestBody
        });
        const errorMsg = data.error || 'Failed to control laser';
        alert(`Error: ${errorMsg}\n\nStatus: ${response.status}\n\nCheck browser console for details.`);
      }
    } catch (error) {
      console.error('❌ Network/Request Error:', error);
      alert(`Failed to send command: ${error.message || 'Network error'}\n\nCheck browser console for details.`);
    } finally {
      // Add small delay before allowing next click to prevent rapid clicking
      setTimeout(() => {
        setControlLoading(false);
      }, 500);
    }
  };

  const getDeviceById = (deviceId) => {
    return devices.find(d => {
      const id = d._id?.toString() || d.deviceId || d._id;
      return id === deviceId || id === deviceId?.toString();
    });
  };

  if (loading) {
    return (
      <div className="laser-control-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="laser-control-container">
      <main className="laser-control-main">
        <div className="laser-control-header">
          <h1 className="laser-control-title">🔴 Laser Control</h1>
          <p className="laser-control-subtitle">
            Control laser light on your ESP32 devices
          </p>
        </div>

        {devices.length === 0 ? (
          <div className="no-devices">
            <div className="no-devices-icon">📡</div>
            <h3>No ESP32 Laser Devices Found</h3>
            <p><strong>Steps to connect:</strong></p>
            <ol style={{textAlign: 'left', display: 'inline-block'}}>
              <li>Upload firmware to ESP32</li>
              <li>Check Serial Monitor for "📤 Polling for commands..."</li>
              <li>Wait for device to auto-register</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        ) : (
          <div className="laser-control-content">
            {/* Device Selection */}
            <div className="device-selector-section">
              <label htmlFor="device-select" className="device-select-label">
                Select Device:
              </label>
              <select
                id="device-select"
                className="device-select"
                value={selectedDevice || ''}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                <option value="">-- Select a device --</option>
                {devices.map((device) => {
                  const id = device._id?.toString() || device.deviceId || device._id;
                  return (
                    <option key={id} value={id}>
                      {device.deviceName || device.deviceId || id} 
                      {device.location && ` - ${device.location}`}
                      {device.status && ` (${device.status})`}
                      {device.isTestDevice && ` [Test]`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Laser Control Section */}
            {selectedDevice && (
              <div className="laser-control-section">
                <div className="device-info-card">
                  {(() => {
                    const device = getDeviceById(selectedDevice);
                    return device ? (
                      <>
                        <h3 className="device-name">{device.deviceName || device.deviceId || device._id}</h3>
                        {device.location && (
                          <p className="device-location">📍 {device.location}</p>
                        )}
                        {device.macAddress && (
                          <p className="device-location">📡 MAC: {device.macAddress}</p>
                        )}
                        <div className={`device-status-badge ${device.isTestDevice ? 'test' : (device.status || 'offline')}`}>
                          {device.isTestDevice ? 'Test Device' : (device.status || 'offline')}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>

                <div className="laser-control-card">
                  <div className="laser-status-indicator">
                    <div className={`laser-indicator ${laserStatus[selectedDevice] ? 'on' : 'off'}`}>
                      <div className="laser-dot"></div>
                      <span className="laser-status-text">
                        {laserStatus[selectedDevice] ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`laser-toggle-button ${laserStatus[selectedDevice] ? 'on' : 'off'} ${controlLoading ? 'loading' : ''}`}
                    onClick={() => {
                      const device = getDeviceById(selectedDevice);
                      toggleLaser(selectedDevice, laserStatus[selectedDevice] || false, device?.macAddress || null);
                    }}
                    disabled={controlLoading}
                  >
                    {controlLoading ? (
                      <span className="button-loading">
                        <span className="spinner-small"></span>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span className="button-icon">
                          {laserStatus[selectedDevice] ? '🔴' : '⚡'}
                        </span>
                        {laserStatus[selectedDevice] ? 'Turn OFF Laser' : 'Turn ON Laser'}
                      </>
                    )}
                  </button>

                  {getDeviceById(selectedDevice)?.status !== 'online' && (
                    <p className="device-offline-warning">
                      ⚠️ Device is offline. Please ensure the device is connected.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

