'use client';

import { useEffect, useState, useRef } from 'react';
import './ar-real.css';

export default function ARReal() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [placedCards, setPlacedCards] = useState([]);
  const [isGyroActive, setIsGyroActive] = useState(false);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-data');
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setSensorData(result.data[0]);
      } else if (Array.isArray(result) && result.length > 0) {
        setSensorData(result[0]);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  const startAR = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsARActive(true);

      // Request device orientation
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          startGyroscope();
        }
      } else {
        startGyroscope();
      }

    } catch (error) {
      console.error('Camera access error:', error);
      alert('Camera access required for AR. Please allow camera permissions.');
    }
  };

  const startGyroscope = () => {
    window.addEventListener('deviceorientation', handleOrientation);
    setIsGyroActive(true);
  };

  const handleOrientation = (event) => {
    setOrientation({
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    });
  };

  const handleScreenTap = (e) => {
    if (!sensorData) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate 3D-like position based on gyroscope
    const depth = 1 + (orientation.beta / 90); // Simulated depth
    const scale = Math.max(0.5, Math.min(1.5, depth));

    const newCard = {
      id: Date.now(),
      x: x,
      y: y,
      scale: scale,
      rotation: orientation.gamma / 2,
      data: { ...sensorData },
      depth: depth
    };

    setPlacedCards([...placedCards, newCard]);
  };

  const removeCard = (id) => {
    setPlacedCards(placedCards.filter(card => card.id !== id));
  };

  const stopAR = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    window.removeEventListener('deviceorientation', handleOrientation);
    setIsARActive(false);
    setIsGyroActive(false);
    setPlacedCards([]);
  };

  if (!isARActive) {
    return (
      <div className="ar-real-container">
        <div className="ar-real-intro">
          <h1>🌱 AR Sensor Display</h1>
          <p>Place 3D sensor displays anywhere in your space - IKEA style!</p>
          
          <div className="sensor-preview">
            <h3>Live Sensor Data:</h3>
            {sensorData ? (
              <div className="preview-data">
                <div className="preview-item">
                  <span className="preview-icon">🌡️</span>
                  <span className="preview-label">Temperature</span>
                  <span className="preview-value">{sensorData.temperature}°C</span>
                </div>
                <div className="preview-item">
                  <span className="preview-icon">💧</span>
                  <span className="preview-label">Humidity</span>
                  <span className="preview-value">{sensorData.humidity}%</span>
                </div>
                <div className="preview-item">
                  <span className="preview-icon">🌊</span>
                  <span className="preview-label">Soil Moisture</span>
                  <span className="preview-value">{sensorData.soilMoisture}%</span>
                </div>
                <div className="preview-item">
                  <span className="preview-icon">☀️</span>
                  <span className="preview-label">Light Level</span>
                  <span className="preview-value">{sensorData.lightLevel} lux</span>
                </div>
              </div>
            ) : (
              <p className="loading-text">Loading sensor data...</p>
            )}
          </div>

          <button 
            className="start-ar-btn" 
            onClick={startAR}
            disabled={!sensorData}
          >
            {sensorData ? '🚀 Start AR - Place Anywhere!' : '⏳ Loading...'}
          </button>

          <div className="ar-info">
            <h4>✨ How it works:</h4>
            <ul>
              <li>📱 Tap anywhere on the screen to place displays</li>
              <li>🔄 Tilt your phone - displays adjust with perspective</li>
              <li>🎯 Place multiple displays in different locations</li>
              <li>👆 Tap on any display to remove it</li>
              <li>📏 Displays scale with distance (perspective effect)</li>
            </ul>
          </div>

          <div className="ar-requirements">
            <p>📱 <strong>Works on ALL devices!</strong></p>
            <p>🌐 iPhone, Android, Desktop - any browser</p>
            <p>📸 Camera permission required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-viewer-container">
      {/* Camera Feed */}
      <video 
        ref={videoRef}
        className="ar-camera-feed"
        playsInline
        autoPlay
      />

      {/* Canvas for placed objects */}
      <div 
        className="ar-placement-layer"
        onClick={handleScreenTap}
      >
        {/* Placed 3D Cards */}
        {placedCards.map((card) => (
          <div
            key={card.id}
            className="ar-placed-card"
            style={{
              left: `${card.x}px`,
              top: `${card.y}px`,
              transform: `translate(-50%, -50%) scale(${card.scale}) rotateZ(${card.rotation}deg) rotateX(${orientation.beta / 10}deg) rotateY(${orientation.gamma / 10}deg)`,
              zIndex: Math.floor(card.depth * 100)
            }}
            onClick={(e) => {
              e.stopPropagation();
              removeCard(card.id);
            }}
          >
            <div className="card-3d-container">
              <div className="card-3d-inner">
                <div className="sensor-card-ar">
                  <div className="card-header-ar">
                    <span className="card-icon-ar">🌱</span>
                    <h3>Garden Sensor</h3>
                    <button className="card-close-ar">✕</button>
                  </div>
                  
                  <div className="card-grid-ar">
                    <div className="sensor-item-ar temp">
                      <span className="sensor-icon-big">🌡️</span>
                      <span className="sensor-label">Temperature</span>
                      <span className="sensor-value-big">{card.data.temperature}°C</span>
                    </div>
                    
                    <div className="sensor-item-ar humidity">
                      <span className="sensor-icon-big">💧</span>
                      <span className="sensor-label">Humidity</span>
                      <span className="sensor-value-big">{card.data.humidity}%</span>
                    </div>
                    
                    <div className="sensor-item-ar soil">
                      <span className="sensor-icon-big">🌊</span>
                      <span className="sensor-label">Soil</span>
                      <span className="sensor-value-big">{card.data.soilMoisture}%</span>
                    </div>
                    
                    <div className="sensor-item-ar light">
                      <span className="sensor-icon-big">☀️</span>
                      <span className="sensor-label">Light</span>
                      <span className="sensor-value-big">{card.data.lightLevel}</span>
                    </div>
                  </div>

                  <div className="card-shadow-3d"></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Crosshair / Placement Indicator */}
        <div className="ar-crosshair">
          <div className="crosshair-inner">
            <div className="crosshair-dot"></div>
            <div className="crosshair-ring"></div>
          </div>
          <p className="crosshair-text">👆 Tap to place sensor display</p>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="ar-controls-overlay">
        <div className="ar-status">
          <span className="status-badge">
            📸 AR Active
          </span>
          {isGyroActive && (
            <span className="status-badge gyro">
              🔄 3D Motion Active
            </span>
          )}
          <span className="status-badge count">
            {placedCards.length} Placed
          </span>
        </div>

        <button className="ar-exit-btn" onClick={stopAR}>
          ← Exit AR
        </button>

        {placedCards.length > 0 && (
          <button 
            className="ar-clear-btn"
            onClick={() => setPlacedCards([])}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="ar-instructions-bottom">
        <p>👆 Tap anywhere to place</p>
        <p>🔄 Tilt phone for 3D effect</p>
        <p>✕ Tap display to remove</p>
      </div>
    </div>
  );
}
