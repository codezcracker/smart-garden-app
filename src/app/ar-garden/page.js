'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './ar-garden.css';

export default function ARGardenDashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [arMode, setArMode] = useState('webar'); // 'webar' or 'webxr'
  const [isLoading, setIsLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(false);
  const arSceneRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    checkCameraPermission();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isARActive && sensorData) {
      if (arMode === 'webar') {
        initializeWebAR();
      } else if (arMode === 'webxr') {
        initializeWebXR();
      }
    }
    return () => {
      cleanupAR();
    };
  }, [isARActive, sensorData, arMode]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
    } catch (err) {
      setCameraPermission(false);
    }
  };

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-test');
      const data = await response.json();
      if (data.length > 0) {
        setSensorData(data[0]);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebAR = () => {
    // Load AR.js and A-Frame
    if (typeof window === 'undefined' || window.AFRAME) return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://aframe.io/releases/1.4.0/aframe.min.js'),
    ]).then(() => {
      loadScript('https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.2/aframe/build/aframe-ar-nft.js').then(() => {
        createARScene();
      });
    });
  };

  const createARScene = () => {
    const container = document.getElementById('ar-container');
    if (!container || !sensorData) return;

    container.innerHTML = `
      <a-scene 
        vr-mode-ui="enabled: false" 
        embedded 
        arjs="sourceType: webcam; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        style="width: 100%; height: 100%;"
      >
        <a-marker type="pattern" url="/markers/hiro.patt" id="garden-marker">
          <!-- 3D Plant Visualization -->
          <a-box 
            position="0 0.5 0" 
            width="0.3" 
            height="0.6" 
            depth="0.3" 
            color="#00ff88"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"
          ></a-box>
          
          <!-- Temperature -->
          <a-text 
            value="🌡️ ${sensorData.temperature?.toFixed(1)}°C"
            position="0 1.2 0"
            align="center"
            color="#ff6b6b"
            scale="2 2 2"
          ></a-text>
          
          <!-- Humidity -->
          <a-text 
            value="💧 ${sensorData.humidity?.toFixed(0)}%"
            position="0 1.0 0"
            align="center"
            color="#4ecdc4"
            scale="2 2 2"
          ></a-text>
          
          <!-- Soil Moisture -->
          <a-text 
            value="🌱 Soil: ${sensorData.soilMoisture?.toFixed(0)}%"
            position="0 0.8 0"
            align="center"
            color="#45b7d1"
            scale="2 2 2"
          ></a-text>
          
          <!-- Light Level -->
          <a-text 
            value="☀️ Light: ${sensorData.lightLevel?.toFixed(0)}%"
            position="0 0.6 0"
            align="center"
            color="#f9ca24"
            scale="2 2 2"
          ></a-text>
          
          <!-- Health Circle -->
          <a-ring 
            radius-inner="0.15"
            radius-outer="0.2"
            position="0 0.4 0"
            rotation="-90 0 0"
            color="#00ff88"
            theta-length="${Math.round(((sensorData.soilMoisture || 0) + (sensorData.lightLevel || 0) + (sensorData.temperature || 0) * 2) / 4) * 3.6}"
          ></a-ring>
          
          <a-text 
            value="${Math.round(((sensorData.soilMoisture || 0) + (sensorData.lightLevel || 0) + (sensorData.temperature || 0) * 2) / 4)}%"
            position="0 0.4 0.1"
            align="center"
            color="#00ff88"
            scale="1.5 1.5 1.5"
          ></a-text>
        </a-marker>
        
        <a-camera gps-camera></a-camera>
      </a-scene>
    `;
  };

  const initializeWebXR = async () => {
    if (!navigator.xr) {
      alert('WebXR not supported on this device. Please use WebAR mode.');
      setArMode('webar');
      return;
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (!supported) {
        alert('AR not supported. Please use WebAR mode with marker.');
        setArMode('webar');
        return;
      }

      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
      });

      // Create WebXR scene with Three.js
      createWebXRScene(session);
    } catch (err) {
      console.error('WebXR initialization failed:', err);
      alert('WebXR failed. Switching to WebAR mode.');
      setArMode('webar');
    }
  };

  const createWebXRScene = (session) => {
    // This would require Three.js and WebXR rendering
    // Simplified version - full implementation would need Three.js setup
    console.log('WebXR session started:', session);
  };

  const cleanupAR = () => {
    const container = document.getElementById('ar-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  const startAR = async () => {
    if (!cameraPermission) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
      } catch (err) {
        alert('Camera permission is required for AR. Please allow camera access.');
        return;
      }
    }
    setIsARActive(true);
  };

  const stopAR = () => {
    setIsARActive(false);
    cleanupAR();
  };

  if (isLoading) {
    return (
      <div className="ar-garden-page">
        <div className="loading-container">
          <div className="loading-spinner">🌱</div>
          <p>Loading AR Garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-garden-page">
      {/* Header */}
      <motion.div 
        className="ar-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>🌱 AR Garden Dashboard</h1>
          <p>View your garden sensor data in Augmented Reality</p>
        </div>
        <div className="ar-controls">
          {!isARActive ? (
            <button onClick={startAR} className="ar-btn start-btn">
              🎯 Start AR
            </button>
          ) : (
            <button onClick={stopAR} className="ar-btn stop-btn">
              ⏹️ Stop AR
            </button>
          )}
        </div>
      </motion.div>

      {/* Instructions */}
      {!isARActive && (
        <motion.div 
          className="ar-instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="instruction-card">
            <h3>📱 How to Use AR Garden</h3>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Print AR Marker</h4>
                  <p>Download and print the Hiro marker pattern</p>
                  <a 
                    href="https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    📄 Download Hiro Marker
                  </a>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Allow Camera Access</h4>
                  <p>Click "Start AR" and allow camera permissions when prompted</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Point Camera at Marker</h4>
                  <p>Hold your phone over the printed marker to see live sensor data floating in AR!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AR Container */}
      <div className="ar-wrapper">
        {isARActive ? (
          <div id="ar-container" className="ar-container">
            {!sensorData && (
              <div className="ar-loading">
                <p>📡 Waiting for sensor data...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="ar-preview">
            <div className="preview-card">
              <h3>📊 Current Sensor Data</h3>
              {sensorData ? (
                <div className="sensor-preview">
                  <div className="sensor-item">
                    <span className="sensor-icon">🌡️</span>
                    <span className="sensor-label">Temperature</span>
                    <span className="sensor-value">{sensorData.temperature?.toFixed(1)}°C</span>
                  </div>
                  <div className="sensor-item">
                    <span className="sensor-icon">💧</span>
                    <span className="sensor-label">Humidity</span>
                    <span className="sensor-value">{sensorData.humidity?.toFixed(0)}%</span>
                  </div>
                  <div className="sensor-item">
                    <span className="sensor-icon">🌱</span>
                    <span className="sensor-label">Soil Moisture</span>
                    <span className="sensor-value">{sensorData.soilMoisture?.toFixed(0)}%</span>
                  </div>
                  <div className="sensor-item">
                    <span className="sensor-icon">☀️</span>
                    <span className="sensor-label">Light Level</span>
                    <span className="sensor-value">{sensorData.lightLevel?.toFixed(0)}%</span>
                  </div>
                </div>
              ) : (
                <p>No sensor data available. Make sure your ESP8266 is connected!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AR Mode Info */}
      <div className="ar-mode-info">
        <p className="info-text">
          {arMode === 'webar' 
            ? '🎯 Using Marker-Based AR - Point camera at printed marker'
            : '🌍 Using World Tracking AR - No marker needed (requires WebXR support)'}
        </p>
      </div>
    </div>
  );
}