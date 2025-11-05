'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ar-tap-place.css';

export default function ARTapToPlace() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [placedCards, setPlacedCards] = useState([]);
  const [tapPosition, setTapPosition] = useState(null);
  const videoRef = useRef(null);

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
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Failed to access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setPlacedCards([]);
  };

  const handleScreenTap = (e) => {
    if (!sensorData) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCard = {
      id: Date.now(),
      x: x,
      y: y,
      data: { ...sensorData },
      timestamp: Date.now()
    };

    setPlacedCards(prev => [...prev, newCard]);
    setTapPosition({ x, y });
    setTimeout(() => setTapPosition(null), 500);
  };

  const removeCard = (id) => {
    setPlacedCards(prev => prev.filter(card => card.id !== id));
  };

  const clearAllCards = () => {
    setPlacedCards([]);
  };

  const handleStartAR = () => {
    setIsARActive(true);
  };

  const handleStopAR = () => {
    setIsARActive(false);
  };

  const plantHealth = sensorData ? Math.round(
    ((sensorData.soilMoisture || 0) + 
     (sensorData.lightLevel || 0) + 
     (sensorData.temperature || 0) * 2) / 4
  ) : 0;

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
              ✨
            </motion.div>
            <h1>🎯 AR Tap to Place</h1>
            <p>Tap anywhere on camera to place glowing sensor data cards!</p>
            <p className="highlight-text">✨ Tap screen = Place card • Tap card = Remove • NEW FEATURE!</p>
            
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
              ✨ Start AR Placement
            </button>
            
            <div className="info-box">
              <p className="info-title">How it works:</p>
              <p>1. Camera opens with your view</p>
              <p>2. Tap anywhere on screen</p>
              <p>3. Glowing card appears at tap location</p>
              <p>4. Tap multiple times to place more cards</p>
              <p>5. Cards stay where you placed them!</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="ar-glass-view" onClick={handleScreenTap}>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="ar-camera-feed"
          />
          
          <AnimatePresence>
            {tapPosition && (
              <motion.div
                className="tap-effect"
                style={{
                  left: tapPosition.x,
                  top: tapPosition.y
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {placedCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="placed-card"
                style={{
                  left: card.x,
                  top: card.y
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeCard(card.id);
                }}
              >
                <div className="card-glow" />
                <div className="card-content">
                  <div className="card-header">
                    <span className="card-number">#{index + 1}</span>
                    <span className="card-close">×</span>
                  </div>
                  <div className="card-grid">
                    <div className="card-item">
                      <span className="card-icon">🌡️</span>
                      <span className="card-value">{card.data.temperature?.toFixed(1)}°C</span>
                    </div>
                    <div className="card-item">
                      <span className="card-icon">💧</span>
                      <span className="card-value">{card.data.humidity?.toFixed(0)}%</span>
                    </div>
                    <div className="card-item">
                      <span className="card-icon">🌱</span>
                      <span className="card-value">{card.data.soilMoisture?.toFixed(0)}%</span>
                    </div>
                    <div className="card-item">
                      <span className="card-icon">☀️</span>
                      <span className="card-value">{card.data.lightLevel?.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="card-health">
                    <div className="health-bar-small">
                      <div 
                        className="health-fill-small" 
                        style={{ 
                          width: `${Math.round(((card.data.soilMoisture || 0) + (card.data.lightLevel || 0) + (card.data.temperature || 0) * 2) / 4)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="ar-top-controls">
            <div className="control-info">
              <span className="info-badge">
                ✨ Tap anywhere to place cards
              </span>
              <span className="card-count-badge">
                📍 {placedCards.length} {placedCards.length === 1 ? 'card' : 'cards'} placed
              </span>
            </div>
          </div>

          <div className="ar-bottom-controls">
            {placedCards.length > 0 && (
              <motion.button 
                className="clear-all-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllCards();
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                🗑️ Clear All
              </motion.button>
            )}
            <motion.button 
              className="stop-ar-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleStopAR();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ⏹️ Stop AR
            </motion.button>
          </div>

          {placedCards.length === 0 && (
            <motion.div 
              className="tap-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                👆
              </motion.div>
              <p>Tap anywhere to place your first card!</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}