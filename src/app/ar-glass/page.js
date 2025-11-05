'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ar-glass.css';

export default function ARGlassView() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isARActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isARActive]);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-test');
      const data = await response.json();
      if (data.length > 0) {
        setSensorData(data[0]);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      
      const video = document.getElementById('ar-video');
      if (video) {
        video.srcObject = mediaStream;
        video.play();
      }
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleStartAR = () => {
    setIsARActive(true);
  };

  const handleStopAR = () => {
    setIsARActive(false);
  };

  // Calculate plant health
  const plantHealth = sensorData ? Math.round(
    ((sensorData.soilMoisture || 0) + 
     (sensorData.lightLevel || 0) + 
     (sensorData.temperature || 0) * 2) / 4
  ) : 0;

  // Determine status colors
  const getStatusColor = (value, type) => {
    if (type === 'temp') {
      if (value < 15) return '#4ecdc4';
      if (value < 25) return '#00ff88';
      if (value < 30) return '#f9ca24';
      return '#ff6b6b';
    }
    if (type === 'humidity') {
      if (value < 30) return '#ff6b6b';
      if (value < 60) return '#00ff88';
      return '#4ecdc4';
    }
    if (type === 'moisture') {
      if (value < 30) return '#ff6b6b';
      if (value < 60) return '#f9ca24';
      return '#00ff88';
    }
    if (type === 'light') {
      if (value < 20) return '#ff6b6b';
      if (value < 50) return '#f9ca24';
      return '#00ff88';
    }
    return '#00ff88';
  };

  return (
    <div className="ar-glass-container">
      {!isARActive ? (
        <motion.div 
          className="ar-glass-start"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="start-content">
            <motion.div 
              className="start-icon"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              📱
            </motion.div>
            <h1>AR Glass View</h1>
            <p>View your sensor data with glassmorphism AR overlay</p>
            <p className="no-marker-text">✨ No marker needed - data follows your camera!</p>
            
            {sensorData && (
              <div className="preview-mini">
                <div className="mini-stat">
                  <span>🌡️ {sensorData.temperature?.toFixed(1)}°C</span>
                  <span>💧 {sensorData.humidity?.toFixed(0)}%</span>
                </div>
                <div className="mini-stat">
                  <span>🌱 {sensorData.soilMoisture?.toFixed(0)}%</span>
                  <span>☀️ {sensorData.lightLevel?.toFixed(0)}%</span>
                </div>
              </div>
            )}
            
            <button onClick={handleStartAR} className="start-ar-btn">
              🎯 Start AR Glass View
            </button>
            
            {error && (
              <div className="error-msg">
                ⚠️ {error}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="ar-glass-view">
          {/* Camera Video */}
          <video 
            id="ar-video"
            autoPlay 
            playsInline 
            muted
            className="ar-camera-feed"
          />
          
          {/* Glass Overlay Cards */}
          <div className="ar-glass-overlay">
            <AnimatePresence>
              {sensorData && (
                <>
                  {/* Top Header */}
                  <motion.div 
                    className="glass-header"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                  >
                    <div className="header-left">
                      <span className="garden-icon">🌱</span>
                      <span className="garden-title">Smart Garden AR</span>
                    </div>
                    <div className="live-indicator">
                      <motion.div 
                        className="live-dot"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span>LIVE</span>
                    </div>
                  </motion.div>

                  {/* Center - Plant Health */}
                  <motion.div 
                    className="glass-card glass-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="health-circle-container">
                      <svg className="health-circle-svg" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#00ff88"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                          animate={{ 
                            strokeDashoffset: 2 * Math.PI * 50 - (plantHealth / 100) * (2 * Math.PI * 50)
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
                        />
                      </svg>
                      <div className="health-text">
                        <motion.div 
                          className="health-value"
                          key={plantHealth}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                        >
                          {plantHealth}%
                        </motion.div>
                        <div className="health-label">Plant Health</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Temperature Card - Top Left */}
                  <motion.div 
                    className="glass-card glass-top-left"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: 0.3 }}
                    style={{ '--status-color': getStatusColor(sensorData.temperature, 'temp') }}
                  >
                    <div className="card-icon">🌡️</div>
                    <div className="card-content">
                      <div className="card-label">Temperature</div>
                      <motion.div 
                        className="card-value"
                        key={sensorData.temperature}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {sensorData.temperature?.toFixed(1)}°C
                      </motion.div>
                    </div>
                    <div className="card-status-bar" />
                  </motion.div>

                  {/* Humidity Card - Top Right */}
                  <motion.div 
                    className="glass-card glass-top-right"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: 0.4 }}
                    style={{ '--status-color': getStatusColor(sensorData.humidity, 'humidity') }}
                  >
                    <div className="card-icon">💧</div>
                    <div className="card-content">
                      <div className="card-label">Humidity</div>
                      <motion.div 
                        className="card-value"
                        key={sensorData.humidity}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {sensorData.humidity?.toFixed(0)}%
                      </motion.div>
                    </div>
                    <div className="card-status-bar" />
                  </motion.div>

                  {/* Soil Moisture Card - Bottom Left */}
                  <motion.div 
                    className="glass-card glass-bottom-left"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: 0.5 }}
                    style={{ '--status-color': getStatusColor(sensorData.soilMoisture, 'moisture') }}
                  >
                    <div className="card-icon">🌱</div>
                    <div className="card-content">
                      <div className="card-label">Soil Moisture</div>
                      <motion.div 
                        className="card-value"
                        key={sensorData.soilMoisture}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {sensorData.soilMoisture?.toFixed(0)}%
                      </motion.div>
                    </div>
                    <div className="card-status-bar" />
                  </motion.div>

                  {/* Light Level Card - Bottom Right */}
                  <motion.div 
                    className="glass-card glass-bottom-right"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: 0.6 }}
                    style={{ '--status-color': getStatusColor(sensorData.lightLevel, 'light') }}
                  >
                    <div className="card-icon">☀️</div>
                    <div className="card-content">
                      <div className="card-label">Light Level</div>
                      <motion.div 
                        className="card-value"
                        key={sensorData.lightLevel}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {sensorData.lightLevel?.toFixed(0)}%
                      </motion.div>
                    </div>
                    <div className="card-status-bar" />
                  </motion.div>

                  {/* Bottom Info */}
                  <motion.div 
                    className="glass-footer"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="footer-info">
                      <span>📡 Last update: {new Date().toLocaleTimeString()}</span>
                      <span>🔄 Auto-refresh: 3s</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Control Button */}
          <motion.button 
            className="ar-stop-btn"
            onClick={handleStopAR}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ⏹️
          </motion.button>
        </div>
      )}
    </div>
  );
}
