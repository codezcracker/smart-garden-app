'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import './ar-real.css';

export default function ARReal() {
  const [sensorData, setSensorData] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [message, setMessage] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState({ three: false, webxr: false });

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-data');
      const result = await response.json();
      console.log('Fetched sensor data:', result);
      
      // Handle both response formats
      if (result.success && result.data && result.data.length > 0) {
        setSensorData(result.data[0]);
      } else if (Array.isArray(result) && result.length > 0) {
        setSensorData(result[0]);
      } else {
        console.log('No sensor data available');
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  const checkScriptsLoaded = (scriptName) => {
    setScriptsLoaded(prev => {
      const newState = { ...prev, [scriptName]: true };
      return newState;
    });
  };

  const startAR = () => {
    if (scriptsLoaded.three && scriptsLoaded.webxr) {
      setIsARActive(true);
      setTimeout(() => {
        initAR();
      }, 100);
    } else {
      setMessage('Loading AR libraries...');
      setTimeout(startAR, 500);
    }
  };

  const initAR = () => {
    const container = document.getElementById('ar-container');
    if (!container) return;

    // Initialize Three.js scene
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    
    const renderer = new window.THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Add lighting
    const light = new window.THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Create sensor display board
    const boardGroup = new window.THREE.Group();
    
    // Main board
    const boardGeometry = new window.THREE.BoxGeometry(0.4, 0.3, 0.02);
    const boardMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x2d5a2d,
      metalness: 0.3,
      roughness: 0.4
    });
    const board = new window.THREE.Mesh(boardGeometry, boardMaterial);
    boardGroup.add(board);

    // Add data panels
    if (sensorData) {
      const dataBoxGeometry = new window.THREE.BoxGeometry(0.15, 0.12, 0.03);
      
      // Temperature
      const tempMaterial = new window.THREE.MeshStandardMaterial({ color: 0xff6b6b });
      const tempBox = new window.THREE.Mesh(dataBoxGeometry, tempMaterial);
      tempBox.position.set(-0.1, 0.08, 0.02);
      boardGroup.add(tempBox);
      
      // Humidity
      const humidityMaterial = new window.THREE.MeshStandardMaterial({ color: 0x4ecdc4 });
      const humidityBox = new window.THREE.Mesh(dataBoxGeometry, humidityMaterial);
      humidityBox.position.set(0.1, 0.08, 0.02);
      boardGroup.add(humidityBox);
      
      // Soil Moisture
      const soilMaterial = new window.THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const soilBox = new window.THREE.Mesh(dataBoxGeometry, soilMaterial);
      soilBox.position.set(-0.1, -0.08, 0.02);
      boardGroup.add(soilBox);
      
      // Light Level
      const lightMaterial = new window.THREE.MeshStandardMaterial({ color: 0xffd93d });
      const lightBox = new window.THREE.Mesh(dataBoxGeometry, lightMaterial);
      lightBox.position.set(0.1, -0.08, 0.02);
      boardGroup.add(lightBox);
    }

    // Position the board in front of camera initially (hidden)
    boardGroup.position.set(0, 0, -2);
    boardGroup.visible = false;
    scene.add(boardGroup);

    // Reticle for placement
    const reticleGeometry = new window.THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const reticleMaterial = new window.THREE.MeshBasicMaterial({ color: 0x4CAF50 });
    const reticle = new window.THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Hit test source
    let hitTestSource = null;
    let hitTestSourceRequested = false;
    let placedObject = null;

    // AR Button
    const arButton = window.ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.getElementById('ar-overlay') }
    });
    
    document.getElementById('ar-button-container').appendChild(arButton);

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle select (tap to place)
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
      if (reticle.visible && !placedObject) {
        // Clone and place the board
        const placedBoard = boardGroup.clone();
        placedBoard.position.setFromMatrixPosition(reticle.matrix);
        placedBoard.visible = true;
        scene.add(placedBoard);
        placedObject = placedBoard;
        
        // Hide reticle after placement
        reticle.visible = false;
        
        setMessage('Sensor display placed! Walk around to view it.');
      }
    });
    scene.add(controller);

    // Animation loop
    function animate() {
      renderer.setAnimationLoop(render);
    }

    function render(timestamp, frame) {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
          session.requestReferenceSpace('viewer').then((referenceSpace) => {
            session.requestHitTestSource({ space: referenceSpace }).then((source) => {
              hitTestSource = source;
            });
          });
          session.addEventListener('end', () => {
            hitTestSourceRequested = false;
            hitTestSource = null;
            placedObject = null;
          });
          hitTestSourceRequested = true;
        }

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

        // Animate placed object
        if (placedObject) {
          placedObject.rotation.y += 0.01;
        }
      }

      renderer.render(scene, camera);
    }

    animate();
  };

  if (!isARActive) {
    return (
      <>
        <Script 
          src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"
          onLoad={() => checkScriptsLoaded('three')}
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/webxr/ARButton.js"
          onLoad={() => checkScriptsLoaded('webxr')}
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

            <button className="start-ar-btn" onClick={startAR}>
              🚀 Launch AR Experience
            </button>

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
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/webxr/ARButton.js"
      />
      
      <div className="ar-real-viewer">
        <div id="ar-container" className="ar-canvas-container"></div>
        
        <div id="ar-overlay" className="ar-overlay-ui">
          <div className="ar-instructions-top">
            <p>👆 Move your phone to find a surface</p>
            <p>⭕ Tap the green circle to place</p>
          </div>

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

        <div id="ar-button-container" className="ar-button-wrapper"></div>

        {message && (
          <div className="ar-notification">
            {message}
          </div>
        )}

        <button 
          className="exit-ar-btn"
          onClick={() => {
            setIsARActive(false);
            window.location.reload();
          }}
        >
          ← Exit AR
        </button>
      </div>
    </>
  );
}
