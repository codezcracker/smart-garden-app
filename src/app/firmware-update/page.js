'use client';

import { useState, useEffect } from 'react';
import '../firmware-update/firmware-update.css';

/**
 * Firmware Update Management Page
 * Allows admins to upload firmware and trigger OTA updates for devices
 */
export default function FirmwareUpdatePage() {
  const [firmwareFile, setFirmwareFile] = useState(null);
  const [version, setVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [firmwareList, setFirmwareList] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDevices();
    fetchFirmwareList();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('❌ No auth token found in localStorage');
        // Redirect to login if no token
        window.location.href = '/auth/login';
        return;
      }

      console.log('📱 Fetching devices with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/iot/user-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Devices fetched successfully:', data.devices?.length || 0);
        setDevices(data.devices || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error fetching devices:', response.status, errorData);
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/auth/login';
        }
      }
    } catch (error) {
      console.error('❌ Error fetching devices:', error);
    }
  };

  const fetchFirmwareList = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/iot/firmware', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFirmwareList(data.firmware || []);
      }
    } catch (error) {
      console.error('Error fetching firmware list:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.bin')) {
        setFirmwareFile(file);
      } else {
        alert('Please select a .bin file');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!firmwareFile || !version) {
      alert('Please select a firmware file and enter a version');
      return;
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      alert('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('auth_token');
      
      const formData = new FormData();
      formData.append('firmware', firmwareFile);
      formData.append('version', version);
      formData.append('releaseNotes', releaseNotes);

      const response = await fetch('/api/iot/firmware', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert('Firmware uploaded successfully!');
        setFirmwareFile(null);
        setVersion('');
        setReleaseNotes('');
        document.getElementById('firmware-file').value = '';
        fetchFirmwareList();
      } else {
        const error = await response.json();
        alert('Upload failed: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading firmware:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerUpdate = async (deviceId, firmwareVersion) => {
    if (!deviceId) {
      alert('Please select a device');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('auth_token');

      console.log('🚀 Triggering OTA update for device:', deviceId);
      console.log('📦 Firmware version:', firmwareVersion || 'latest');

      const response = await fetch('/api/iot/firmware', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: deviceId,
          firmwareVersion: firmwareVersion || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ OTA update queued:', data);
        alert('✅ OTA update queued successfully!\n\nThe device will:\n1. Check for updates on next connection\n2. Download firmware automatically\n3. Install and reboot\n\nCheck your device Serial Monitor for progress.');
        fetchDevices();
      } else {
        const error = await response.json();
        console.error('❌ OTA trigger failed:', error);
        alert('❌ Failed to trigger update: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error triggering update:', error);
      alert('❌ Failed to trigger update: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="firmware-update-page">
      <div className="firmware-update-container">
        <h1>🔧 Firmware Update Management</h1>
        
        {/* Upload Firmware Section */}
        <div className="firmware-upload-section">
          <h2>Upload New Firmware</h2>
          <form onSubmit={handleUpload} className="firmware-upload-form">
            <div className="form-group">
              <label htmlFor="firmware-file">Firmware File (.bin)</label>
              <input
                id="firmware-file"
                type="file"
                accept=".bin"
                onChange={handleFileChange}
                required
              />
              {firmwareFile && (
                <p className="file-info">
                  Selected: {firmwareFile.name} ({(firmwareFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="version">Version (e.g., 1.0.0)</label>
              <input
                id="version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="2.1.0"
                pattern="^\d+\.\d+\.\d+$"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="release-notes">Release Notes</label>
              <textarea
                id="release-notes"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="Bug fixes and improvements..."
                rows="4"
              />
            </div>
            
            <button type="submit" disabled={uploading} className="upload-button">
              {uploading ? 'Uploading...' : 'Upload Firmware'}
            </button>
          </form>
        </div>

        {/* Firmware List Section */}
        <div className="firmware-list-section">
          <h2>Available Firmware Versions</h2>
          {firmwareList.length > 0 ? (
            <div className="firmware-list">
              {firmwareList.map((fw) => (
                <div key={fw.id} className="firmware-item">
                  <div className="firmware-info">
                    <h3>Version {fw.version}</h3>
                    <p>Size: {(fw.size / 1024).toFixed(2)} KB</p>
                    <p>Uploaded: {new Date(fw.uploadDate).toLocaleDateString()}</p>
                    {fw.releaseNotes && (
                      <p className="release-notes">{fw.releaseNotes}</p>
                    )}
                  </div>
                  <div className="firmware-actions">
                    <a
                      href={`/api/iot/firmware/download?id=${fw.id}`}
                      download
                      className="download-button"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No firmware versions available</p>
          )}
        </div>

        {/* Device Update Section */}
        <div className="device-update-section">
          <h2>Trigger OTA Update for Device</h2>
          {devices.length === 0 ? (
            <div className="no-devices-message" style={{
              padding: '2rem',
              textAlign: 'center',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <p style={{ marginBottom: '1rem', color: '#856404' }}>
                ⚠️ No devices found. You need to add devices before you can trigger OTA updates.
              </p>
              <p style={{ marginBottom: '1rem', color: '#856404' }}>
                Go to <a href="/my-devices" style={{ color: '#4caf50', textDecoration: 'underline' }}>My Devices</a> to add a device.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#856404' }}>
                Devices can be added manually or discovered automatically.
              </p>
            </div>
          ) : (
            <div className="update-form">
              <div className="form-group">
                <label htmlFor="device-select">Select Device</label>
                <select
                  id="device-select"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  <option value="">-- Select Device --</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.deviceName || device.deviceId} ({device.status})
                    </option>
                  ))}
                </select>
              </div>
            
            <div className="form-group">
              <label htmlFor="firmware-select">Firmware Version (leave empty for latest)</label>
              <select
                id="firmware-select"
                onChange={(e) => {
                  if (e.target.value) {
                    handleTriggerUpdate(selectedDevice, e.target.value);
                  }
                }}
              >
                <option value="">-- Select Version --</option>
                {firmwareList.map((fw) => (
                  <option key={fw.id} value={fw.version}>
                    Version {fw.version}
                  </option>
                ))}
              </select>
            </div>
            
              <button
                onClick={() => handleTriggerUpdate(selectedDevice)}
                disabled={!selectedDevice || updating}
                className="update-button"
              >
                {updating ? 'Triggering Update...' : 'Trigger OTA Update (Latest)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

