'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import './ar-real.css';

export default function ARReal() {
  const [sensorData, setSensorData] = useState(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [isARSupported, setIsARSupported] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check WebXR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsARSupported(supported);
        if (!supported) {
          setErrorMsg('Your device does not support WebXR AR. Requires: iPhone 12+ (Safari) or Android with ARCore (Chrome).');
        }
      }).catch(() => {
        setIsARSupported(false);
        setErrorMsg('WebXR not available. Use Safari on iPhone or Chrome on Android.');
      });
    } else {
      setIsARSupported(false);
      setErrorMsg('WebXR not supported. Try Safari (iPhone) or Chrome (Android with ARCore).');
    }
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

  const startWebXRAR = async () => {
    if (!navigator.xr) {
      alert('WebXR not supported on this device');
      return;
    }

    if (!window.THREE) {
      alert('3D library not loaded yet. Please wait and try again.');
      return;
    }

    try {
      // Initialize Three.js scene
      const scene = new window.THREE.Scene();
      
      const camera = new window.THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );

      const renderer = new window.THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      
      document.body.appendChild(renderer.domElement);

      // Lighting
      const light = new window.THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      light.position.set(0.5, 1, 0.25);
      scene.add(light);

      const directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Create 3D sensor display board
      const createSensorBoard = () => {
        const group = new window.THREE.Group();

        // Main board
        const boardGeometry = new window.THREE.BoxGeometry(0.3, 0.4, 0.02);
        const boardMaterial = new window.THREE.MeshStandardMaterial({
          color: 0x2d5a2d,
          metalness: 0.2,
          roughness: 0.7
        });
        const board = new window.THREE.Mesh(boardGeometry, boardMaterial);
        group.add(board);

        // Data boxes with sensor info
        const boxGeometry = new window.THREE.BoxGeometry(0.12, 0.12, 0.04);
        
        // Temperature - Red
        const tempMaterial = new window.THREE.MeshStandardMaterial({
          color: 0xff4444,
          metalness: 0.3,
          roughness: 0.5
        });
        const tempBox = new window.THREE.Mesh(boxGeometry, tempMaterial);
        tempBox.position.set(-0.08, 0.13, 0.03);
        group.add(tempBox);

        // Humidity - Cyan
        const humidityMaterial = new window.THREE.MeshStandardMaterial({
          color: 0x44dddd,
          metalness: 0.3,
          roughness: 0.5
        });
        const humidityBox = new window.THREE.Mesh(boxGeometry, humidityMaterial);
        humidityBox.position.set(0.08, 0.13, 0.03);
        group.add(humidityBox);

        // Soil - Brown
        const soilMaterial = new window.THREE.MeshStandardMaterial({
          color: 0x8b4513,
          metalness: 0.3,
          roughness: 0.5
        });
        const soilBox = new window.THREE.Mesh(boxGeometry, soilMaterial);
        soilBox.position.set(-0.08, 0.01, 0.03);
        group.add(soilBox);

        // Light - Yellow
        const lightMaterial = new window.THREE.MeshStandardMaterial({
          color: 0xffdd44,
          metalness: 0.3,
          roughness: 0.5
        });
        const lightBox = new window.THREE.Mesh(boxGeometry, lightMaterial);
        lightBox.position.set(0.08, 0.01, 0.03);
        group.add(lightBox);

        // Add sphere on top as indicator
        const sphereGeometry = new window.THREE.SphereGeometry(0.03, 16, 16);
        const sphereMaterial = new window.THREE.MeshStandardMaterial({
          color: 0x4CAF50,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x4CAF50,
          emissiveIntensity: 0.5
        });
        const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, -0.15, 0.03);
        group.add(sphere);

        return group;
      };

      // Reticle for placement
      const reticleGeometry = new window.THREE.RingGeometry(0.10, 0.12, 32);
      reticleGeometry.rotateX(-Math.PI / 2);
      const reticleMaterial = new window.THREE.MeshBasicMaterial({
        color: 0x4CAF50,
        side: window.THREE.DoubleSide
      });
      const reticle = new window.THREE.Mesh(reticleGeometry, reticleMaterial);
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add(reticle);

      // Store placed objects
      const placedObjects = [];

      // Request AR session
      const sessionInit = {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
        domOverlay: { root: document.getElementById('ar-overlay') }
      };

      const session = await navigator.xr.requestSession('immersive-ar', sessionInit);
      
      session.addEventListener('end', () => {
        renderer.xr.setSession(null);
        document.body.removeChild(renderer.domElement);
        placedObjects.forEach(obj => scene.remove(obj));
      });

      await renderer.xr.setSession(session);

      // Hit test source
      let hitTestSource = null;
      let hitTestSourceRequested = false;

      // Controller for tap events
      const controller = renderer.xr.getController(0);
      
      controller.addEventListener('select', () => {
        if (reticle.visible) {
          // Place new sensor board at reticle position
          const sensorBoard = createSensorBoard();
          sensorBoard.position.setFromMatrixPosition(reticle.matrix);
          sensorBoard.quaternion.setFromRotationMatrix(reticle.matrix);
          scene.add(sensorBoard);
          placedObjects.push(sensorBoard);
          
          // Show message
          const msgEl = document.getElementById('ar-message');
          if (msgEl) {
            msgEl.textContent = `Placed ${placedObjects.length} sensor display(s)! Walk around to view from all angles.`;
            msgEl.style.display = 'block';
            setTimeout(() => {
              msgEl.style.display = 'none';
            }, 3000);
          }
        }
      });

      scene.add(controller);

      // Animation loop
      renderer.setAnimationLoop((timestamp, frame) => {
        if (frame) {
          const referenceSpace = renderer.xr.getReferenceSpace();
          const session = frame.session;

          // Request hit test source
          if (!hitTestSourceRequested) {
            session.requestReferenceSpace('viewer').then((refSpace) => {
              session.requestHitTestSource({ space: refSpace }).then((source) => {
                hitTestSource = source;
              });
            });

            session.addEventListener('end', () => {
              hitTestSourceRequested = false;
              hitTestSource = null;
            });

            hitTestSourceRequested = true;
          }

          // Perform hit test
          if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            
            if (hitTestResults.length > 0) {
              const hit = hitTestResults[0];
              const pose = hit.getPose(referenceSpace);
              
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
            } else {
              reticle.visible = false;
            }
          }

          // Animate placed objects
          placedObjects.forEach((obj, index) => {
            obj.rotation.y += 0.005;
            obj.children[5].position.y = -0.15 + Math.sin(timestamp * 0.002 + index) * 0.02;
          });

          renderer.render(scene, camera);
        }
      });

    } catch (error) {
      console.error('WebXR Error:', error);
      
      let errorMessage = 'Failed to start AR session.\\n\\n';
      
      if (error.name === 'NotSupportedError') {
        errorMessage += 'Your device does not support WebXR AR.\\n\\n';
        errorMessage += 'Compatible devices:\\n';
        errorMessage += '• iPhone 12+ with iOS 14.3+ (Safari)\\n';
        errorMessage += '• Google Pixel 3+ (Chrome)\\n';
        errorMessage += '• Samsung Galaxy S9+ (Chrome)\\n';
        errorMessage += '• OnePlus 7+ (Chrome)';
      } else if (error.name === 'SecurityError') {
        errorMessage += 'AR requires HTTPS.\\n';
        errorMessage += 'Please use: https://smart-garden-app.vercel.app/ar-real';
      } else if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied.\\n';
        errorMessage += 'Please allow camera access and try again.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"
        onLoad={() => setThreeLoaded(true)}
        strategy="beforeInteractive"
      />

      <div className="ar-real-container">
        <div className="ar-real-intro">
          <h1>🌱 TRUE 3D AR Placement</h1>
          <p>Place sensor displays in your REAL physical space - just like IKEA!</p>
          
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

          {isARSupported === true && (
            <button 
              className="start-ar-btn" 
              onClick={startWebXRAR}
              disabled={!sensorData || !threeLoaded}
            >
              {!threeLoaded ? '⏳ Loading 3D Engine...' : 
               !sensorData ? '⏳ Loading Data...' : 
               '🚀 Start TRUE AR Experience'}
            </button>
          )}

          {isARSupported === false && (
            <div className="ar-error">
              <h3>⚠️ AR Not Supported</h3>
              <p>{errorMsg}</p>
            </div>
          )}

          {isARSupported === null && (
            <div className="ar-checking">
              <div className="spinner"></div>
              <p>Checking AR support...</p>
            </div>
          )}

          <div className="ar-info">
            <h4>✨ TRUE Spatial AR (WebXR):</h4>
            <ul>
              <li>📱 Move phone to scan surfaces (floor, tables, walls)</li>
              <li>⭕ Green circle appears on detected surfaces</li>
              <li>👆 Tap circle to place 3D sensor display</li>
              <li>🚶 Walk around - object stays anchored in space!</li>
              <li>👁️ View from ANY angle - it's a real 3D object</li>
              <li>🎯 Place multiple displays anywhere you want</li>
            </ul>
          </div>

          <div className="ar-requirements">
            <p><strong>✅ Compatible Devices:</strong></p>
            <p>📱 iPhone 12+ with iOS 14.3+ (Safari browser)</p>
            <p>📱 Google Pixel 3+ (Chrome browser)</p>
            <p>📱 Samsung Galaxy S9, S10, S20, S21, S22 (Chrome)</p>
            <p>📱 OnePlus 7, 8, 9 (Chrome)</p>
            <p>📱 Most Android flagships with ARCore</p>
            <br/>
            <p><strong>❌ Not Compatible:</strong></p>
            <p>Desktop computers, older phones, budget phones</p>
            <br/>
            <p>🔒 <strong>Must use HTTPS:</strong> https://smart-garden-app.vercel.app/ar-real</p>
          </div>
        </div>
      </div>

      {/* AR Overlay - shown during AR session */}
      <div id="ar-overlay" style={{ display: 'none' }}>
        <div className="ar-hud">
          <div className="ar-instructions-hud">
            <p>👆 Tap green circle to place</p>
            <p>🚶 Walk around to view from all angles</p>
          </div>
          
          {sensorData && (
            <div className="ar-data-display">
              <div className="data-pill">
                🌡️ {sensorData.temperature}°C
              </div>
              <div className="data-pill">
                💧 {sensorData.humidity}%
              </div>
              <div className="data-pill">
                🌊 {sensorData.soilMoisture}%
              </div>
              <div className="data-pill">
                ☀️ {sensorData.lightLevel}
              </div>
            </div>
          )}

          <div id="ar-message" className="ar-message-box"></div>
        </div>
      </div>
    </>
  );
}
