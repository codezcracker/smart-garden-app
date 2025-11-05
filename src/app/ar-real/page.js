'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import './ar-real.css';

export default function ARReal() {
  const [sensorData, setSensorData] = useState(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    
    // Check WebXR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsARSupported(supported);
        if (!supported) {
          setErrorMessage('AR not supported on this device. Try Chrome on Android or Safari on iPhone.');
        }
      }).catch(() => {
        setIsARSupported(false);
        setErrorMessage('WebXR not available. Please use a compatible browser.');
      });
    } else {
      setErrorMessage('WebXR not available. Please use Chrome (Android) or Safari (iOS).');
    }
    
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

  const startARSession = async () => {
    if (!navigator.xr) {
      alert('WebXR not supported on this device');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      document.getElementById('ar-container').appendChild(canvas);
      
      const gl = canvas.getContext('webgl', { xrCompatible: true });
      
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.getElementById('ar-overlay') }
      });

      await gl.makeXRCompatible();
      
      // Initialize Three.js with WebXR
      if (window.THREE && window.ARButton) {
        initThreeAR(canvas, session);
      } else {
        alert('3D libraries not loaded. Please refresh and try again.');
      }
      
    } catch (error) {
      console.error('AR Error:', error);
      if (error.name === 'NotSupportedError') {
        alert('AR is not supported on this device.\n\nRequires:\n- iPhone 6S+ with iOS 12+\n- Android with ARCore (Pixel, Samsung S9+, etc.)');
      } else if (error.name === 'SecurityError') {
        alert('AR requires HTTPS. Please use: https://smart-garden-app.vercel.app/ar-real');
      } else {
        alert('Failed to start AR: ' + error.message);
      }
    }
  };

  const initThreeAR = (canvas, session) => {
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    
    const renderer = new window.THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: true, 
      alpha: true,
      context: canvas.getContext('webgl', { xrCompatible: true })
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setSession(session);

    // Add lighting
    const light = new window.THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Create sensor display
    const boardGroup = new window.THREE.Group();
    
    const boardGeometry = new window.THREE.BoxGeometry(0.4, 0.3, 0.02);
    const boardMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x2d5a2d,
      metalness: 0.3,
      roughness: 0.4
    });
    const board = new window.THREE.Mesh(boardGeometry, boardMaterial);
    boardGroup.add(board);

    // Add colored data boxes
    const dataBoxGeometry = new window.THREE.BoxGeometry(0.15, 0.12, 0.03);
    
    const boxes = [
      { color: 0xff6b6b, pos: [-0.1, 0.08, 0.02] },  // Temperature
      { color: 0x4ecdc4, pos: [0.1, 0.08, 0.02] },   // Humidity
      { color: 0x8b4513, pos: [-0.1, -0.08, 0.02] }, // Soil
      { color: 0xffd93d, pos: [0.1, -0.08, 0.02] }   // Light
    ];

    boxes.forEach(({ color, pos }) => {
      const material = new window.THREE.MeshStandardMaterial({ color });
      const box = new window.THREE.Mesh(dataBoxGeometry, material);
      box.position.set(...pos);
      boardGroup.add(box);
    });

    boardGroup.visible = false;
    scene.add(boardGroup);

    // Reticle
    const reticleGeometry = new window.THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const reticleMaterial = new window.THREE.MeshBasicMaterial({ color: 0x4CAF50 });
    const reticle = new window.THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource = null;
    let placedObject = null;

    session.requestReferenceSpace('viewer').then((referenceSpace) => {
      session.requestHitTestSource({ space: referenceSpace }).then((source) => {
        hitTestSource = source;
      });
    });

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
      if (reticle.visible && !placedObject) {
        const placedBoard = boardGroup.clone();
        placedBoard.position.setFromMatrixPosition(reticle.matrix);
        placedBoard.visible = true;
        scene.add(placedBoard);
        placedObject = placedBoard;
        reticle.visible = false;
      }
    });
    scene.add(controller);

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();

        if (hitTestSource && !placedObject) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length) {
            const hit = hitTestResults[0];
            reticle.visible = true;
            reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
          } else {
            reticle.visible = false;
          }
        }

        if (placedObject) {
          placedObject.rotation.y += 0.01;
        }
      }

      renderer.render(scene, camera);
    });
  };

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"
        strategy="beforeInteractive"
      />
      
      <div className="ar-real-container">
        <div className="ar-real-intro">
          <h1>🌱 3D AR Placement</h1>
          <p>Place your garden sensor display in real 3D space - just like IKEA!</p>
          
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
            onClick={startARSession}
            disabled={!sensorData}
          >
            {sensorData ? '🚀 Launch AR Experience' : '⏳ Loading...'}
          </button>

          {errorMessage && (
            <div className="ar-error">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="ar-info">
            <h4>✨ True 3D AR Placement:</h4>
            <ul>
              <li>📱 Tap anywhere to place your 3D sensor display</li>
              <li>🚶 Walk around it in your real space</li>
              <li>👁️ View from any angle</li>
              <li>🏠 Place it on tables, floor, or in the air!</li>
            </ul>
          </div>

          <div className="ar-requirements">
            <p>📱 <strong>Required:</strong> iPhone 6S+ (iOS 12+) or Android with ARCore</p>
            <p>🌐 <strong>Browser:</strong> Safari (iOS) or Chrome (Android)</p>
            <p>🔒 <strong>HTTPS required</strong> - use the Vercel deployment</p>
          </div>
        </div>
      </div>

      <div id="ar-container" className="ar-canvas-container" style={{ display: 'none' }}></div>
      <div id="ar-overlay" className="ar-overlay-ui">
        {sensorData && (
          <div className="ar-data-hud">
            <div className="hud-item">
              <span className="hud-icon">🌡️</span>
              <span className="hud-value">{sensorData.temperature}°C</span>
            </div>
            <div className="hud-item">
              <span className="hud-icon">💧</span>
              <span className="hud-value">{sensorData.humidity}%</span>
            </div>
            <div className="hud-item">
              <span className="hud-icon">🌊</span>
              <span className="hud-value">{sensorData.soilMoisture}%</span>
            </div>
            <div className="hud-item">
              <span className="hud-icon">☀️</span>
              <span className="hud-value">{sensorData.lightLevel} lux</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
