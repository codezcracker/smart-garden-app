'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './ar-garden.css';

export default function ARGardenDashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [arReady, setArReady] = useState(false);
  const [error, setError] = useState(null);
  const arContainerRef = useRef(null);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isARActive) {
      loadARLibraries().then(() => {
        setArReady(true);
        setTimeout(() => {
          createARScene();
        }, 500);
      }).catch(err => {
        console.error('AR library loading failed:', err);
        setError('Failed to load AR libraries. Please refresh the page.');
      });
    } else {
      cleanupAR();
      setArReady(false);
      setError(null);
    }
  }, [isARActive, sensorData]);

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

  const loadARLibraries = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.AFRAME && window.AFRAME.systems && window.AFRAME.systems.arjs) {
        resolve();
        return;
      }

      // Load A-Frame first
      if (!window.AFRAME) {
        const aframeScript = document.createElement('script');
        aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
        aframeScript.onload = () => {
          // Load AR.js after A-Frame (using standard build for better compatibility)
          const arjsScript = document.createElement('script');
          arjsScript.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.2/aframe/build/aframe-ar.js';
          arjsScript.onload = () => {
            // Wait a bit for AR.js to initialize
            setTimeout(() => {
              if (window.AFRAME && window.AFRAME.systems && window.AFRAME.systems.arjs) {
                resolve();
              } else {
                reject(new Error('AR.js system not found'));
              }
            }, 100);
          };
          arjsScript.onerror = () => reject(new Error('Failed to load AR.js'));
          document.head.appendChild(arjsScript);
        };
        aframeScript.onerror = () => reject(new Error('Failed to load A-Frame'));
        document.head.appendChild(aframeScript);
      } else {
        // A-Frame loaded, just load AR.js
        const arjsScript = document.createElement('script');
        arjsScript.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.2/aframe/build/aframe-ar.js';
        arjsScript.onload = () => {
          setTimeout(() => {
            if (window.AFRAME && window.AFRAME.systems && window.AFRAME.systems.arjs) {
              resolve();
            } else {
              reject(new Error('AR.js system not found'));
            }
          }, 100);
        };
        arjsScript.onerror = () => reject(new Error('Failed to load AR.js'));
        document.head.appendChild(arjsScript);
      }
    });
  };

  const createARScene = () => {
    const container = document.getElementById('ar-container');
    if (!container) {
      console.error('AR container not found');
      return;
    }

    if (!sensorData) {
      container.innerHTML = `
        <div class="ar-loading">
          <p>📡 Waiting for sensor data...</p>
          <p class="ar-hint">Make sure your ESP8266 is connected!</p>
        </div>
      `;
      return;
    }

    // Calculate health
    const healthValue = Math.round(
      ((sensorData.soilMoisture || 0) + 
       (sensorData.lightLevel || 0) + 
       (sensorData.temperature || 0) * 2) / 4
    );

    // Use Hiro marker from CDN (standard AR.js marker)
    const markerUrl = 'https://jeromeetienne.github.io/AR.js/data/images/HIRO.patt';

    container.innerHTML = `
      <a-scene 
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; detectionMode: mono_and_matrix; matrixCodeType: 3x3; debugUIEnabled: false; trackingMethod: best;"
        style="width: 100%; height: 100%;"
      >
        <!-- Marker -->
        <a-marker 
          type="pattern" 
          url="${markerUrl}"
          id="garden-marker"
          raycaster="objects: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;"
        >
          <!-- 3D Plant Visualization -->
          <a-box 
            position="0 0.5 0" 
            width="0.3" 
            height="0.6" 
            depth="0.3" 
            color="#00ff88"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"
            class="clickable"
          ></a-box>
          
          <!-- Temperature Card -->
          <a-plane 
            position="0 1.5 0"
            width="0.8"
            height="0.3"
            color="#ff6b6b"
            opacity="0.9"
            rotation="-30 0 0"
          ></a-plane>
          <a-text 
            value="🌡️ ${sensorData.temperature?.toFixed(1)}°C"
            position="0 1.5 0.01"
            align="center"
            color="#ffffff"
            scale="1.5 1.5 1.5"
            width="10"
          ></a-text>
          
          <!-- Humidity Card -->
          <a-plane 
            position="0.6 1.2 0"
            width="0.7"
            height="0.3"
            color="#4ecdc4"
            opacity="0.9"
            rotation="-30 0 0"
          ></a-plane>
          <a-text 
            value="💧 ${sensorData.humidity?.toFixed(0)}%"
            position="0.6 1.2 0.01"
            align="center"
            color="#ffffff"
            scale="1.5 1.5 1.5"
            width="10"
          ></a-text>
          
          <!-- Soil Moisture Card -->
          <a-plane 
            position="-0.6 1.2 0"
            width="0.7"
            height="0.3"
            color="#45b7d1"
            opacity="0.9"
            rotation="-30 0 0"
          ></a-plane>
          <a-text 
            value="🌱 ${sensorData.soilMoisture?.toFixed(0)}%"
            position="-0.6 1.2 0.01"
            align="center"
            color="#ffffff"
            scale="1.5 1.5 1.5"
            width="10"
          ></a-text>
          
          <!-- Light Level Card -->
          <a-plane 
            position="0 0.9 0"
            width="0.8"
            height="0.3"
            color="#f9ca24"
            opacity="0.9"
            rotation="-30 0 0"
          ></a-plane>
          <a-text 
            value="☀️ ${sensorData.lightLevel?.toFixed(0)}%"
            position="0 0.9 0.01"
            align="center"
            color="#ffffff"
            scale="1.5 1.5 1.5"
            width="10"
          ></a-text>
          
          <!-- Health Circle Background -->
          <a-ring 
            radius-inner="0.18"
            radius-outer="0.25"
            position="0 0.4 0"
            rotation="-90 0 0"
            color="#333333"
            opacity="0.5"
          ></a-ring>
          
          <!-- Health Circle Progress -->
          <a-ring 
            radius-inner="0.18"
            radius-outer="0.25"
            position="0 0.4 0"
            rotation="-90 0 0"
            color="#00ff88"
            theta-length="${healthValue * 3.6}"
            opacity="0.9"
          ></a-ring>
          
          <!-- Health Text -->
          <a-text 
            value="${healthValue}%"
            position="0 0.4 0.1"
            align="center"
            color="#00ff88"
            scale="2 2 2"
            width="5"
          ></a-text>
          
          <!-- Health Label -->
          <a-text 
            value="Health"
            position="0 0.2 0.1"
            align="center"
            color="#ffffff"
            scale="1 1 1"
            width="5"
          ></a-text>
        </a-marker>
        
        <!-- Camera -->
        <a-entity camera="fov: 60; near: 0.1; far: 1000;" look-controls="enabled: false"></a-entity>
      </a-scene>
    `;

    // Add event listeners for marker detection
    setTimeout(() => {
      const scene = container.querySelector('a-scene');
      if (scene) {
        const marker = scene.querySelector('#garden-marker');
        if (marker) {
          marker.addEventListener('markerFound', () => {
            console.log('Marker detected!');
          });
          marker.addEventListener('markerLost', () => {
            console.log('Marker lost');
          });
        }
      }
    }, 1000);
  };

  const cleanupAR = () => {
    const container = document.getElementById('ar-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  const startAR = async () => {
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setIsARActive(true);
      setError(null);
    } catch (err) {
      console.error('Camera permission denied:', err);
      setError('Camera permission is required for AR. Please allow camera access in your browser settings.');
      alert('Camera permission is required for AR. Please allow camera access.');
    }
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

      {/* Error Message */}
      {error && (
        <div className="ar-error">
          <p>⚠️ {error}</p>
        </div>
      )}

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
          <div id="ar-container" ref={arContainerRef} className="ar-container">
            {!arReady && (
              <div className="ar-loading">
                <div className="loading-spinner">🌱</div>
                <p>Loading AR...</p>
                <p className="ar-hint">Initializing camera and AR libraries...</p>
              </div>
            )}
            {arReady && !sensorData && (
              <div className="ar-loading">
                <p>📡 Waiting for sensor data...</p>
                <p className="ar-hint">Make sure your ESP8266 is connected!</p>
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

      {/* AR Status Info */}
      {isARActive && (
        <div className="ar-mode-info">
          <p className="info-text">
            🎯 Point your camera at the printed Hiro marker to see sensor data in AR!
          </p>
          {sensorData && (
            <p className="info-text-small">
              Data updates every 3 seconds • Last update: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}