/**
 * Interactive Garden Component
 * 
 * This component creates an animated, real-time visualization of a smart garden
 * that reflects actual sensor data from IoT devices. It displays:
 * - Dynamic sky (day/night based on light sensor)
 * - Realistic sun with animated rays and waves
 * - Moon for nighttime
 * - Slow-moving clouds
 * - Water layer showing soil moisture level
 * - Soil layer with realistic appearance and particles
 * - Glassmorphism sensor info panel
 * 
 * @component
 * @requires React hooks (useState, useEffect)
 * @requires CSS file: interactive-garden.css
 */

'use client';

import { useState, useEffect } from 'react';
import './interactive-garden.css';

/**
 * Creates realistic SVG root designs for plants
 * Generates 5 different root system patterns (taproot, fibrous, spreading, etc.)
 * Each root has main roots, secondary branches, and root hairs
 * 
 * @param {number} index - Index to select which root design to use
 * @returns {JSX.Element} SVG element with root system
 */
// SVG Root Paths - Realistic root designs inspired by botanical illustrations
const createRootSVG = (index) => {
  const rootDesigns = [
    // Design 1: Classic taproot system
    <svg viewBox="0 0 120 250" className="root-svg" key={`root-${index}-1`}>
      <path
        d="M60 0 L60 250"
        stroke="rgba(101, 67, 33, 0.98)"
        strokeWidth="4"
        fill="none"
        className="main-root-path"
        strokeLinecap="round"
      />
      <path d="M60 30 L45 50 L35 70 L28 95" stroke="rgba(101, 67, 33, 0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 35 L75 55 L85 75 L92 100" stroke="rgba(101, 67, 33, 0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 60 L50 80 L42 105 L36 130" stroke="rgba(101, 67, 33, 0.85)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 70 L70 90 L78 115 L85 140" stroke="rgba(101, 67, 33, 0.85)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 100 L48 120 L40 145 L35 170" stroke="rgba(101, 67, 33, 0.8)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M60 110 L72 130 L80 155 L85 180" stroke="rgba(101, 67, 33, 0.8)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {Array.from({ length: 12 }).map((_, i) => {
        const y = 40 + i * 15;
        const x = 60 + (Math.random() - 0.5) * 35;
        const angle = (Math.random() - 0.5) * 25;
        return (
          <line
            key={`hair-${i}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle * Math.PI / 180) * 5}
            y2={y + Math.sin(angle * Math.PI / 180) * 5 + 4}
            stroke="rgba(101, 67, 33, 0.6)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        );
      })}
    </svg>,

    // Design 2: Fibrous root system
    <svg viewBox="0 0 120 250" className="root-svg" key={`root-${index}-2`}>
      <path
        d="M60 0 L60 80"
        stroke="rgba(101, 67, 33, 0.95)"
        strokeWidth="3"
        fill="none"
        className="main-root-path"
        strokeLinecap="round"
      />
      {Array.from({ length: 10 }).map((_, i) => {
        const startY = 15 + i * 20;
        const side = i % 2 === 0 ? -1 : 1;
        const spread = 15 + i * 6;
        return (
          <path
            key={`fibrous-${i}`}
            d={`M60 ${startY} L${60 + side * spread} ${startY + 25} L${60 + side * (spread + 8)} ${startY + 55} L${60 + side * (spread + 12)} ${startY + 90}`}
            stroke="rgba(101, 67, 33, 0.85)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({ length: 18 }).map((_, i) => {
        const y = 25 + i * 11;
        const x = 60 + (Math.random() - 0.5) * 50;
        const angle = (Math.random() - 0.5) * 35;
        return (
          <line
            key={`hair-${i}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle * Math.PI / 180) * 4}
            y2={y + Math.sin(angle * Math.PI / 180) * 4 + 3}
            stroke="rgba(101, 67, 33, 0.5)"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>,

    // Design 3: Spreading root system
    <svg viewBox="0 0 120 250" className="root-svg" key={`root-${index}-3`}>
      <path
        d="M60 0 L60 100"
        stroke="rgba(101, 67, 33, 0.96)"
        strokeWidth="3.5"
        fill="none"
        className="main-root-path"
        strokeLinecap="round"
      />
      <path d="M60 20 L30 40 L15 65 L8 95 L5 130" stroke="rgba(101, 67, 33, 0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 25 L90 45 L105 70 L112 100 L115 135" stroke="rgba(101, 67, 33, 0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 45 L25 70 L10 100 L5 135 L3 170" stroke="rgba(101, 67, 33, 0.85)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 50 L95 75 L110 105 L115 140 L117 175" stroke="rgba(101, 67, 33, 0.85)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {Array.from({ length: 6 }).map((_, i) => {
        const startY = 60 + i * 25;
        const side = i % 2 === 0 ? -1 : 1;
        const offset = 20 + i * 12;
        return (
          <path
            key={`secondary-${i}`}
            d={`M60 ${startY} L${60 + side * offset} ${startY + 20} L${60 + side * (offset + 10)} ${startY + 45} L${60 + side * (offset + 15)} ${startY + 75}`}
            stroke="rgba(101, 67, 33, 0.75)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 30 + i * 18;
        const x = 60 + (Math.random() - 0.5) * 60;
        const angle = (Math.random() - 0.5) * 30;
        return (
          <line
            key={`hair-${i}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle * Math.PI / 180) * 4}
            y2={y + Math.sin(angle * Math.PI / 180) * 4 + 3}
            stroke="rgba(101, 67, 33, 0.55)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
        );
      })}
    </svg>,

    // Design 4: Deep vertical taproot
    <svg viewBox="0 0 120 250" className="root-svg" key={`root-${index}-4`}>
      <path
        d="M60 0 L60 250"
        stroke="rgba(101, 67, 33, 0.98)"
        strokeWidth="4.5"
        fill="none"
        className="main-root-path"
        strokeLinecap="round"
      />
      {Array.from({ length: 6 }).map((_, i) => {
        const startY = 40 + i * 35;
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <path
            key={`lateral-${i}`}
            d={`M60 ${startY} L${60 + side * 20} ${startY + 20} L${60 + side * 30} ${startY + 45} L${60 + side * 35} ${startY + 75} L${60 + side * 38} ${startY + 110}`}
            stroke="rgba(101, 67, 33, 0.88)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 50 + i * 22;
        const x = 60 + (Math.random() - 0.5) * 30;
        const angle = (Math.random() - 0.5) * 20;
        return (
          <line
            key={`hair-${i}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle * Math.PI / 180) * 5}
            y2={y + Math.sin(angle * Math.PI / 180) * 5 + 4}
            stroke="rgba(101, 67, 33, 0.65)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        );
      })}
    </svg>,

    // Design 5: Branching root system
    <svg viewBox="0 0 120 250" className="root-svg" key={`root-${index}-5`}>
      <path
        d="M60 0 L60 180"
        stroke="rgba(101, 67, 33, 0.97)"
        strokeWidth="3.2"
        fill="none"
        className="main-root-path"
        strokeLinecap="round"
      />
      <path d="M60 20 L40 40 L25 65 L15 95 L10 130" stroke="rgba(101, 67, 33, 0.9)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d="M60 25 L80 45 L95 70 L105 100 L110 135" stroke="rgba(101, 67, 33, 0.9)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d="M60 50 L35 75 L20 105 L12 140 L8 175" stroke="rgba(101, 67, 33, 0.85)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 55 L85 80 L100 110 L108 145 L112 180" stroke="rgba(101, 67, 33, 0.85)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {Array.from({ length: 8 }).map((_, i) => {
        const startY = 80 + i * 20;
        const side = i % 2 === 0 ? -1 : 1;
        const offset = 18 + i * 4;
        return (
          <path
            key={`tertiary-${i}`}
            d={`M60 ${startY} L${60 + side * offset} ${startY + 15} L${60 + side * (offset + 6)} ${startY + 35} L${60 + side * (offset + 10)} ${startY + 60}`}
            stroke="rgba(101, 67, 33, 0.75)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({ length: 15 }).map((_, i) => {
        const y = 35 + i * 12;
        const x = 60 + (Math.random() - 0.5) * 55;
        const angle = (Math.random() - 0.5) * 40;
        return (
          <line
            key={`hair-${i}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle * Math.PI / 180) * 4}
            y2={y + Math.sin(angle * Math.PI / 180) * 4 + 3}
            stroke="rgba(101, 67, 33, 0.5)"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  ];
  
  return rootDesigns[index % rootDesigns.length];
};

const rootSVGs = Array.from({ length: 5 }, (_, i) => createRootSVG(i));

/**
 * Main Interactive Garden Component
 * Fetches real-time sensor data and renders animated garden visualization
 */
export default function InteractiveGarden() {
  // State for sensor readings (light, temperature, humidity, soil moisture)
  const [sensorData, setSensorData] = useState({
    lightLevel: 50,      // 0-100% light level
    temperature: 22,     // Temperature in Celsius
    humidity: 60,        // Humidity percentage
    soilMoisture: 45     // Soil moisture percentage (0-100)
  });
  
  // State for garden plants (currently hidden but can be enabled)
  const [plants, setPlants] = useState([]);
  
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  
  // Time of day determined by light sensor ('day' or 'night')
  const [timeOfDay, setTimeOfDay] = useState('day');

  /**
   * Effect: Fetch garden data on mount and set up polling interval
   * Updates sensor data every 5 seconds for real-time visualization
   */
  useEffect(() => {
    fetchGardenData();
    
    // Poll for sensor data updates every 5 seconds
    const interval = setInterval(fetchGardenData, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Effect: Determine day/night based on light sensor reading
   * Updates sky appearance, sun/moon visibility, and animations
   * Threshold: > 25% = day, <= 25% = night
   */
  useEffect(() => {
    // Determine time of day based on light level from real sensor data
    // Light sensors typically read 0-100% (normalized from 0-1024)
    // Day: > 25%, Night: <= 25% (adjust threshold as needed)
    const lightThreshold = 25;
    const currentLight = sensorData.lightLevel;
    
    if (currentLight > lightThreshold) {
      setTimeOfDay('day');
    } else {
      setTimeOfDay('night');
    }
    
    console.log('🌅 Light level:', currentLight + '%', 'Time of day:', currentLight > lightThreshold ? '☀️ DAY' : '🌙 NIGHT');
  }, [sensorData.lightLevel]);

  /**
   * Fetches real-time sensor data from IoT devices
   * Retrieves light, temperature, humidity, and soil moisture readings
   * Also fetches garden plant configurations
   */
  const fetchGardenData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch user devices and sensor data
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const devicesResponse = await fetch('/api/iot/user-devices', {
        headers: headers
      });

      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        const devices = devicesData.devices || [];

        // Get latest sensor data from devices
        if (devices.length > 0) {
          // Try to get sensor data from latest readings API
          try {
            const token = localStorage.getItem('auth_token');
            const sensorResponse = await fetch('/api/sensors/data?limit=1', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (sensorResponse.ok) {
              const sensorDataResult = await sensorResponse.json();
              const latestReadings = sensorDataResult.latestReadings || {};
              
              // Find light level reading
              const lightReading = latestReadings.lightLevel || latestReadings.light || 
                Object.values(latestReadings).find(r => r.sensorType === 'lightLevel' || r.sensorType === 'light');
              
              // Find temperature reading
              const tempReading = latestReadings.temperature || latestReadings.temp ||
                Object.values(latestReadings).find(r => r.sensorType === 'temperature');
              
              // Find humidity reading
              const humidityReading = latestReadings.humidity ||
                Object.values(latestReadings).find(r => r.sensorType === 'humidity');
              
              // Find soil moisture reading
              const moistureReading = latestReadings.soilMoisture || latestReadings.moisture ||
                Object.values(latestReadings).find(r => r.sensorType === 'soilMoisture');
              
              // Normalize light level (0-1024 to 0-100, or use as-is if already 0-100)
              let lightLevel = lightReading?.value || lightReading?.reading || 50;
              if (lightLevel > 100) {
                lightLevel = (lightLevel / 1024) * 100; // Normalize from 0-1024 to 0-100
              }
              
              setSensorData({
                lightLevel: Math.round(lightLevel),
                temperature: tempReading?.value || tempReading?.reading || 22,
                humidity: humidityReading?.value || humidityReading?.reading || 60,
                soilMoisture: moistureReading?.value || moistureReading?.reading || 45
              });
              
              console.log('Real sensor data:', {
                lightLevel: Math.round(lightLevel),
                temperature: tempReading?.value || tempReading?.reading || 22,
                humidity: humidityReading?.value || humidityReading?.reading || 60,
                soilMoisture: moistureReading?.value || moistureReading?.reading || 45
              });
            }
          } catch (sensorError) {
            console.log('Could not fetch from sensors API, trying device data:', sensorError);
          }
          
          // Fallback to device latestData
          const latestDevice = devices.find(d => d.status === 'online') || devices[0];
          
          if (latestDevice.latestData?.sensors) {
            const sensors = latestDevice.latestData.sensors;
            let lightLevel = sensors.lightLevel || 50;
            if (lightLevel > 100) {
              lightLevel = (lightLevel / 1024) * 100;
            }
            
            setSensorData({
              lightLevel: Math.round(lightLevel),
              temperature: sensors.temperature || 22,
              humidity: sensors.humidity || 60,
              soilMoisture: sensors.soilMoisture || 45
            });
          } else if (latestDevice.latestData) {
            // Try alternative sensor data structure
            const data = latestDevice.latestData;
            let lightLevel = data.lightLevel || data.light || 50;
            if (lightLevel > 100) {
              lightLevel = (lightLevel / 1024) * 100;
            }
            
            setSensorData({
              lightLevel: Math.round(lightLevel),
              temperature: data.temperature || data.temp || 22,
              humidity: data.humidity || 60,
              soilMoisture: data.soilMoisture || data.moisture || 45
            });
          }
        }

        // Fetch gardens to get plants
        const gardensResponse = await fetch('/api/iot/gardens', {
          headers: headers
        });

        if (gardensResponse.ok) {
          const gardensData = await gardensResponse.json();
          // Extract plants from gardens (if gardens have plant data)
          // For now, we'll use sample plants based on garden configuration
          const gardenPlants = gardensData.gardens?.[0]?.plants || [];
          setPlants(gardenPlants.length > 0 ? gardenPlants : getDefaultPlants());
        } else {
          setPlants(getDefaultPlants());
        }
      } else {
        setPlants(getDefaultPlants());
      }
    } catch (error) {
      console.error('Error fetching garden data:', error);
      setPlants(getDefaultPlants());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPlants = () => {
    // Default plants if no garden data available
    return [
      { id: 1, name: 'Tomato', emoji: '🍅', x: 20, size: 1.0 },
      { id: 2, name: 'Carrot', emoji: '🥕', x: 40, size: 0.8 },
      { id: 3, name: 'Lettuce', emoji: '🥬', x: 60, size: 0.9 },
      { id: 4, name: 'Pepper', emoji: '🫑', x: 80, size: 0.85 }
    ];
  };

  /**
   * Calculate sun position and intensity based on light sensor data
   * Sun position: 20-80% horizontally (based on light level 0-100%)
   * Sun intensity: 0-1 scale based on light level
   * Sun ray intensity: Based on temperature (10-45°C normalized to 0-1)
   * Cloud visibility: Based on LDR sensor - low light (shadow) = more clouds
   */
  const sunPosition = 20 + (sensorData.lightLevel / 100) * 60;
  const sunIntensity = Math.min(1, sensorData.lightLevel / 100);
  const sunRayIntensity = Math.max(0, Math.min(1, (sensorData.temperature - 10) / 35));
  
  // Cloud visibility based on LDR sensor (low light = shadow = more clouds)
  // Light level < 60% = shadow detected, show more clouds (adjusted threshold)
  const cloudVisibility = Math.max(0, Math.min(1, (60 - sensorData.lightLevel) / 60));
  const numberOfClouds = Math.ceil(cloudVisibility * 5); // 0-5 clouds based on shadow
  
  // Sun waves visibility based on temperature (more heat = more waves)
  // Temperature > 15°C shows waves, intensity increases with temperature (adjusted threshold)
  const sunWaveIntensity = Math.max(0, Math.min(1, (sensorData.temperature - 15) / 30)); // 15-45°C = 0-1
  const numberOfSunWaves = Math.max(1, Math.ceil(sunWaveIntensity * 8)); // At least 1 wave, up to 8 waves based on temperature
  
  // Water bubbles based on moisture (more moisture = more bubbles)
  const bubbleCount = Math.ceil((sensorData.soilMoisture / 100) * 25); // 0-25 bubbles based on moisture
  
  // Debug logs to verify calculations
  console.log('🌱 Interactive Garden Debug:', {
    lightLevel: sensorData.lightLevel,
    temperature: sensorData.temperature,
    soilMoisture: sensorData.soilMoisture,
    cloudVisibility: cloudVisibility.toFixed(2),
    numberOfClouds: numberOfClouds,
    sunWaveIntensity: sunWaveIntensity.toFixed(2),
    numberOfSunWaves: numberOfSunWaves,
    bubbleCount: bubbleCount
  });

  /**
   * Calculate moon position (opposite side of sun)
   * Moon appears when sun is low/absent (nighttime)
   */
  const moonPosition = 100 - (sunPosition - 20) / 60 * 100;

  if (loading) {
    return (
      <div className="interactive-garden-container">
        <div className="loading-garden">
          <div className="loading-spinner"></div>
          <p>Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-garden-container">
      {/* Sky Layer */}
      <div className={`sky-layer ${timeOfDay}`}>
        {/* Sun */}
        {timeOfDay === 'day' && (
          <>
            <div 
              className="sun"
              style={{
                left: `${sunPosition}%`,
                opacity: sunIntensity,
                transform: `scale(${0.8 + sunIntensity * 0.4})`
              }}
            >
              {/* Realistic sun core - no emoji */}
              <div className="sun-core"></div>
              {/* Sun rays */}
              <div 
                className="sun-rays"
                style={{
                  opacity: sunRayIntensity * 0.8,
                  transform: `scale(${0.7 + sunRayIntensity * 0.3})`
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i}
                    className="sun-ray"
                    style={{
                      transform: `rotate(${i * 30}deg)`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Sun waves - Small lines emanating from sun based on temperature/heat */}
            {/* More temperature = more lines visible */}
            <div 
              className="sun-waves"
              style={{
                opacity: Math.max(0.1, sunWaveIntensity * 0.9), // At least 10% visible
                left: `${sunPosition}%`,
                bottom: `min(40vh, 300px)`
              }}
            >
              {Array.from({ length: numberOfSunWaves * 3 }).map((_, i) => {
                // Calculate angle for radial spread (from -45deg to 45deg, fanning downward)
                const totalWaves = numberOfSunWaves * 3;
                const maxIndex = Math.max(1, totalWaves - 1);
                const angle = -45 + (i / maxIndex) * 90; // Spread from -45 to +45 degrees
                const distance = 200 + Math.random() * 150; // Distance from sun (200-350px)
                return (
                  <div
                    key={i}
                    className="sun-wave-line-small"
                    style={{
                      '--angle': `${angle}deg`,
                      '--distance': `${distance}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Moon */}
        {timeOfDay === 'night' && (
          <div 
            className="moon"
            style={{
              left: `${moonPosition}%`,
              opacity: 1 - sunIntensity
            }}
          >
            <div className="moon-core">🌙</div>
            <div className="moon-glow"></div>
          </div>
        )}

        {/* Clouds - Based on LDR sensor (shadow detection) */}
        {/* Low light level = shadow detected = more clouds visible */}
        {/* Always show clouds container, opacity and count based on light level */}
        <div className="clouds">
          {Array.from({ length: numberOfClouds }).map((_, i) => (
            <div 
              key={i}
              className="cloud"
              style={{
                left: `${20 + i * 30}%`,
                opacity: Math.max(0.1, cloudVisibility), // At least 10% visible
                animationDelay: `${i * 40}s`,
                animationDuration: `${120 + i * 30}s` // Very slow - 120-180 seconds
              }}
            />
          ))}
        </div>
      </div>

      {/* Plants Layer - Hidden */}
      {/* <div className="plants-layer">
        {plants.length > 0 ? plants.map((plant, plantIndex) => {
          const rootSVG = rootSVGs[plantIndex % rootSVGs.length];
          
          return (
            <div
              key={plant.id || plant.name}
              className="plant-item"
              style={{
                left: `${plant.x || Math.random() * 80 + 10}%`,
                bottom: `min(40vh, 300px)`,
                transform: `scale(${plant.size || 1})`,
                animationDelay: `${(plant.id || 1) * 0.2}s`
              }}
            >
              <div className="plant-above-ground">
                <div className="plant-emoji">{plant.emoji || '🌱'}</div>
                <div className="plant-shadow"></div>
                <div className="plant-name">{plant.name || 'Plant'}</div>
              </div>
              
              <div className="plant-stem-base"></div>
              
              <div className="root-system">
                <div className="root-svg-container">
                  {rootSVG}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="no-plants-message">No plants in garden yet</div>
        )}
      </div> */}

      {/* Water Layer - Visualizes soil moisture level */}
      {/* Height dynamically adjusts based on soilMoisture percentage (0-100%) */}
      <div 
        className="water-layer"
        style={{
          height: `calc(min(40vh, 300px) * ${sensorData.soilMoisture} / 100)`,
          bottom: 0
        }}
      >
        <div className="water-surface">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="water-wave"
              style={{
                left: `${i * 5}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
        {/* Water bubbles - Number based on moisture sensor value */}
        {/* More moisture = more bubbles floating */}
        <div className="water-bubbles">
          {Array.from({ length: bubbleCount }).map((_, i) => (
            <div 
              key={i}
              className="water-bubble"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.4 + (sensorData.soilMoisture / 100) * 0.4 // More moisture = more visible bubbles
              }}
            />
          ))}
        </div>
      </div>

      {/* Soil Layer - Realistic soil visualization */}
      {/* Color and brightness change based on moisture level */}
      {/* Wet soil (>50%): darker brown tones */}
      {/* Dry soil (<=50%): lighter brown tones */}
      <div className="soil-container">
        <div 
          className="soil-layer"
          style={{
            filter: `brightness(${0.85 + (sensorData.soilMoisture / 100) * 0.15}) saturate(${0.8 + (sensorData.soilMoisture / 100) * 0.2})`,
            background: `linear-gradient(180deg, 
              ${sensorData.soilMoisture > 50 
                ? `#8d6a4a 0%, #7d5a3a 3%, #9d7a5a 8%, #8d6a4a 12%, #a8825e 18%, #b8956a 30%, #a8825e 50%, #986f52 70%, #885c46 85%, #784a3a 100%` // Wet: darker at top
                : `#a8825e 0%, #986f52 5%, #c9a876 12%, #b8956a 20%, #a8825e 30%, #986f52 45%, #885c46 65%, #784a3a 85%, #68382e 100%` // Dry: darker at top, lighter below
              })`
          }}
        >
          {/* Small soil particles - static (no animation) */}
          <div className="soil-particles">
            {Array.from({ length: 200 }).map((_, i) => {
              const size = 2 + Math.random() * 4; // Smaller dots: 2-6px
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              return (
                <div
                  key={`particle-${i}`}
                  className="soil-particle"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}%`,
                    top: `${top}%`
                    // No animation - completely static (removed animationDelay)
                  }}
                />
              );
            })}
          </div>
          
          {/* Upper soil layer - darker and more realistic */}
          <div className="soil-top-layer"></div>
          
          {/* Soil Wetness Overlay - shows moisture */}
          <div 
            className="soil-wetness"
            style={{
              opacity: sensorData.soilMoisture / 100 * 0.5,
              background: `linear-gradient(to bottom, 
                rgba(52, 152, 219, ${sensorData.soilMoisture / 100 * 0.25}) 0%,
                rgba(41, 128, 185, ${sensorData.soilMoisture / 100 * 0.3}) 50%,
                rgba(30, 102, 150, ${sensorData.soilMoisture / 100 * 0.35}) 100%)`
            }}
          />
        </div>
      </div>

      {/* Sensor Info Panel - Glassmorphism design */}
      {/* Displays real-time sensor readings in a transparent glass panel */}
      <div className="sensor-info-panel">
        <div className="sensor-item">
          <span className="sensor-label">Light:</span>
          <span className="sensor-value">{Math.round(sensorData.lightLevel)}%</span>
        </div>
        <div className="sensor-item">
          <span className="sensor-label">Temp:</span>
          <span className="sensor-value">{Math.round(sensorData.temperature)}°C</span>
        </div>
        <div className="sensor-item">
          <span className="sensor-label">Humidity:</span>
          <span className="sensor-value">{Math.round(sensorData.humidity)}%</span>
        </div>
        <div className="sensor-item">
          <span className="sensor-label">Moisture:</span>
          <span className="sensor-value">{Math.round(sensorData.soilMoisture)}%</span>
        </div>
      </div>
    </div>
  );
}
