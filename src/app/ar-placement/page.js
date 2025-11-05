'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './ar-placement.css';

export default function ARPlacementView() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [error, setError] = useState(null);
  const [placedObjects, setPlacedObjects] = useState([]);
  const canvasRef = useRef(null);
  const sessionRef = useRef(null);
  const glRef = useRef(null);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    checkARSupport();
    return () => clearInterval(interval);
  }, []);

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

  const checkARSupport = async () => {
    if ('xr' in navigator) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        setIsARSupported(supported);
        if (!supported) {
          setError('WebXR AR not supported on this device. Please use Chrome on Android or Safari on iOS 13+');
        }
      } catch (err) {
        setIsARSupported(false);
        setError('WebXR not available. Try using Chrome on Android or Safari on iOS 13+');
      }
    } else {
      setIsARSupported(false);
      setError('WebXR not supported in this browser. Use Chrome on Android or Safari on iOS 13+');
    }
  };

  const startARSession = async () => {
    if (!isARSupported) {
      setError('AR not supported on this device');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        optionalFeatures: ['dom-overlay-for-handheld-ar'],
        domOverlay: { root: document.getElementById('ar-overlay') }
      });

      sessionRef.current = session;
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl', { xrCompatible: true });
      glRef.current = gl;

      await setupWebXRSession(session, gl);
      setIsARActive(true);
      setError(null);

    } catch (err) {
      console.error('AR Session Error:', err);
      if (err.message.includes('dom-overlay')) {
        // Fallback without dom-overlay
        startARSessionWithoutOverlay();
      } else {
        setError(`Failed to start AR: ${err.message}. Make sure you're using a supported browser.`);
      }
    }
  };

  const startARSessionWithoutOverlay = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
      });

      sessionRef.current = session;
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl', { xrCompatible: true });
      glRef.current = gl;

      await setupWebXRSession(session, gl);
      setIsARActive(true);
      setError(null);

    } catch (err) {
      console.error('AR Session Error:', err);
      setError('Your device may not support WebXR AR. Try Chrome on Android 8+ or Safari on iOS 13+');
    }
  };

  const setupWebXRSession = async (session, gl) => {
    session.addEventListener('end', handleSessionEnd);

    const glLayer = new XRWebGLLayer(session, gl);
    await session.updateRenderState({ baseLayer: glLayer });

    const referenceSpace = await session.requestReferenceSpace('local');
    const viewerSpace = await session.requestReferenceSpace('viewer');

    // Hit test source for placing objects
    const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    // Start render loop
    const onXRFrame = (time, frame) => {
      session.requestAnimationFrame(onXRFrame);

      const pose = frame.getViewerPose(referenceSpace);
      if (!pose) return;

      const glLayer = session.renderState.baseLayer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

      // Hit test for surface detection
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        // Draw indicator where user can place object
        // This is where you'd render a placement indicator
      }

      // Clear and render
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Render placed sensor data cards
      for (const view of pose.views) {
        const viewport = glLayer.getViewport(view);
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        
        // Here you would render 3D sensor data cards using WebGL
        // For now, we'll use DOM overlay approach
      }
    };

    session.requestAnimationFrame(onXRFrame);
  };

  const handleSessionEnd = () => {
    setIsARActive(false);
    sessionRef.current = null;
  };

  const stopARSession = () => {
    if (sessionRef.current) {
      sessionRef.current.end();
    }
  };

  const placeSensorData = () => {
    // This would place sensor data at the detected surface
    if (sensorData) {
      setPlacedObjects([...placedObjects, {
        id: Date.now(),
        data: { ...sensorData }
      }]);
    }
  };

  // Fallback to model-viewer approach for better compatibility
  return (
    <div className="ar-placement-container">
      {!isARActive ? (
        <motion.div 
          className="ar-placement-start"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="start-content">
            <motion.div 
              className="start-icon"
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "linear"
              }}
            >
              📍
            </motion.div>
            <h1>AR Placement View</h1>
            <p>Place sensor data cards in your real world</p>
            <p className="feature-text">✨ Tap to place • Walk around • Objects stay in place</p>
            
            {sensorData && (
              <div className="preview-data">
                <div className="preview-row">
                  <div className="preview-item">
                    <span className="preview-icon">🌡️</span>
                    <span className="preview-value">{sensorData.temperature?.toFixed(1)}°C</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-icon">💧</span>
                    <span className="preview-value">{sensorData.humidity?.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="preview-row">
                  <div className="preview-item">
                    <span className="preview-icon">🌱</span>
                    <span className="preview-value">{sensorData.soilMoisture?.toFixed(0)}%</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-icon">☀️</span>
                    <span className="preview-value">{sensorData.lightLevel?.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )}

            {isARSupported ? (
              <>
                <button onClick={startARSession} className="start-ar-btn">
                  📍 Start AR Placement
                </button>
                <div className="info-box">
                  <p className="info-title">How it works:</p>
                  <p>1. Point camera at floor or table</p>
                  <p>2. Tap screen to place sensor data</p>
                  <p>3. Walk around - data stays anchored</p>
                  <p>4. Place multiple cards anywhere</p>
                </div>
              </>
            ) : (
              <div className="fallback-section">
                <h3>⚠️ WebXR AR Not Available</h3>
                <p>{error}</p>
                <div className="fallback-options">
                  <a href="/ar-glass" className="fallback-btn">
                    🪟 Use AR Glass View (No Placement)
                  </a>
                  <a href="/ar-garden" className="fallback-btn">
                    🎯 Use Marker-Based AR
                  </a>
                </div>
                <div className="compatibility-info">
                  <h4>Device Requirements:</h4>
                  <ul>
                    <li>✅ Android 8+ with ARCore support (Chrome)</li>
                    <li>✅ iOS 13+ (Safari or Chrome)</li>
                    <li>✅ WebXR-compatible browser</li>
                  </ul>
                </div>
              </div>
            )}

            {error && isARSupported && (
              <div className="error-msg">
                ⚠️ {error}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="ar-placement-view">
          <canvas ref={canvasRef} className="ar-canvas" />
          
          {/* DOM Overlay for controls */}
          <div id="ar-overlay" className="ar-dom-overlay">
            <div className="ar-controls">
              <button onClick={placeSensorData} className="place-btn">
                📍 Tap to Place Data
              </button>
              <button onClick={stopARSession} className="stop-btn">
                ⏹️ Stop AR
              </button>
            </div>
            
            {sensorData && (
              <div className="current-data-overlay">
                <div className="data-chip">
                  🌡️ {sensorData.temperature?.toFixed(1)}°C
                </div>
                <div className="data-chip">
                  💧 {sensorData.humidity?.toFixed(0)}%
                </div>
                <div className="data-chip">
                  🌱 {sensorData.soilMoisture?.toFixed(0)}%
                </div>
                <div className="data-chip">
                  ☀️ {sensorData.lightLevel?.toFixed(0)}%
                </div>
              </div>
            )}

            <div className="placement-hint">
              Point camera at a surface and tap "Place Data"
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
