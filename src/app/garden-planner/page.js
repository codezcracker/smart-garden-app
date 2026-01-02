'use client';

import { useState } from 'react';
import './garden-planner.css';

export default function GardenPlanner() {
  const [selectedGarden, setSelectedGarden] = useState(null);

  const gardenLayouts = [
    {
      id: 'rectangular',
      name: 'Rectangular Garden',
      icon: '▬',
      description: 'Standard rectangular garden bed',
      dimensions: '10m x 3m',
      sensorPositions: [
        { id: 1, name: 'Start', position: { x: 15, y: 50 }, color: '#4caf50' },
        { id: 2, name: 'Middle', position: { x: 50, y: 50 }, color: '#2196f3' },
        { id: 3, name: 'End', position: { x: 85, y: 50 }, color: '#ff9800' }
      ]
    },
    {
      id: 'square',
      name: 'Square Garden',
      icon: '▢',
      description: 'Square raised bed or plot',
      dimensions: '5m x 5m',
      sensorPositions: [
        { id: 1, name: 'Start', position: { x: 20, y: 30 }, color: '#4caf50' },
        { id: 2, name: 'Middle', position: { x: 50, y: 50 }, color: '#2196f3' },
        { id: 3, name: 'End', position: { x: 80, y: 70 }, color: '#ff9800' }
      ]
    },
    {
      id: 'l-shaped',
      name: 'L-Shaped Garden',
      icon: '⌐',
      description: 'L-shaped corner garden',
      dimensions: '8m x 8m',
      sensorPositions: [
        { id: 1, name: 'Start', position: { x: 25, y: 25 }, color: '#4caf50' },
        { id: 2, name: 'Middle', position: { x: 50, y: 60 }, color: '#2196f3' },
        { id: 3, name: 'End', position: { x: 75, y: 75 }, color: '#ff9800' }
      ]
    },
    {
      id: 'circular',
      name: 'Circular Garden',
      icon: '○',
      description: 'Round garden bed',
      dimensions: '6m diameter',
      sensorPositions: [
        { id: 1, name: 'Start', position: { x: 50, y: 20 }, color: '#4caf50' },
        { id: 2, name: 'Middle', position: { x: 50, y: 50 }, color: '#2196f3' },
        { id: 3, name: 'End', position: { x: 50, y: 80 }, color: '#ff9800' }
      ]
    },
    {
      id: 'long-narrow',
      name: 'Long Narrow Garden',
      icon: '▃',
      description: 'Long narrow strip garden',
      dimensions: '15m x 2m',
      sensorPositions: [
        { id: 1, name: 'Start', position: { x: 10, y: 50 }, color: '#4caf50' },
        { id: 2, name: 'Middle', position: { x: 50, y: 50 }, color: '#2196f3' },
        { id: 3, name: 'End', position: { x: 90, y: 50 }, color: '#ff9800' }
      ]
    },
    {
      id: 'irregular',
      name: 'Irregular Garden',
      icon: '◪',
      description: 'Custom irregular shape',
      dimensions: 'Variable',
      sensorPositions: [
        { id: 1, name: 'Start', position: { x: 20, y: 40 }, color: '#4caf50' },
        { id: 2, name: 'Middle', position: { x: 55, y: 55 }, color: '#2196f3' },
        { id: 3, name: 'End', position: { x: 80, y: 65 }, color: '#ff9800' }
      ]
    }
  ];

  const renderGardenShape = (layout) => {
    const shapes = {
      rectangular: (
        <div className="garden-shape rectangular">
          <div className="soil-bed rectangular-soil"></div>
          {layout.sensorPositions.map(sensor => (
            <div
              key={sensor.id}
              className="sensor-marker"
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
                backgroundColor: sensor.color
              }}
              title={sensor.name}
            >
              {sensor.id}
            </div>
          ))}
        </div>
      ),
      square: (
        <div className="garden-shape square">
          <div className="soil-bed square-soil"></div>
          {layout.sensorPositions.map(sensor => (
            <div
              key={sensor.id}
              className="sensor-marker"
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
                backgroundColor: sensor.color
              }}
              title={sensor.name}
            >
              {sensor.id}
            </div>
          ))}
        </div>
      ),
      'l-shaped': (
        <div className="garden-shape l-shaped">
          <div className="l-part-1">
            <div className="soil-bed l-soil-1"></div>
          </div>
          <div className="l-part-2">
            <div className="soil-bed l-soil-2"></div>
          </div>
          {layout.sensorPositions.map(sensor => (
            <div
              key={sensor.id}
              className="sensor-marker"
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
                backgroundColor: sensor.color
              }}
              title={sensor.name}
            >
              {sensor.id}
            </div>
          ))}
        </div>
      ),
      circular: (
        <div className="garden-shape circular">
          <div className="soil-bed circular-soil"></div>
          {layout.sensorPositions.map(sensor => (
            <div
              key={sensor.id}
              className="sensor-marker"
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
                backgroundColor: sensor.color
              }}
              title={sensor.name}
            >
              {sensor.id}
            </div>
          ))}
        </div>
      ),
      'long-narrow': (
        <div className="garden-shape long-narrow">
          <div className="soil-bed long-narrow-soil"></div>
          {layout.sensorPositions.map(sensor => (
            <div
              key={sensor.id}
              className="sensor-marker"
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
                backgroundColor: sensor.color
              }}
              title={sensor.name}
            >
              {sensor.id}
            </div>
          ))}
        </div>
      ),
      irregular: (
        <div className="garden-shape irregular">
          <div className="soil-bed irregular-soil"></div>
          {layout.sensorPositions.map(sensor => (
            <div
              key={sensor.id}
              className="sensor-marker"
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
                backgroundColor: sensor.color
              }}
              title={sensor.name}
            >
              {sensor.id}
            </div>
          ))}
        </div>
      )
    };
    return shapes[layout.id] || shapes.rectangular;
  };

  return (
    <div className="garden-planner-page">
      <div className="planner-header">
        <h1>🌱 Garden Sensor Planner</h1>
        <p>Choose your garden layout and see optimal sensor placement for 3 soil moisture sensors</p>
      </div>

      <div className="garden-layouts-grid">
        {gardenLayouts.map((layout) => (
          <div
            key={layout.id}
            className={`layout-card ${selectedGarden?.id === layout.id ? 'selected' : ''}`}
            onClick={() => setSelectedGarden(layout)}
          >
            <div className="layout-icon">{layout.icon}</div>
            <h3>{layout.name}</h3>
            <p className="layout-description">{layout.description}</p>
            <p className="layout-dimensions">📏 {layout.dimensions}</p>
          </div>
        ))}
      </div>

      {selectedGarden && (
        <div className="selected-garden-section">
          <h2>📍 Sensor Placement for {selectedGarden.name}</h2>
          <p className="placement-info">
            We recommend placing 3 soil moisture sensors in these positions for optimal coverage:
          </p>

          <div className="garden-visualization">
            {renderGardenShape(selectedGarden)}
          </div>

          <div className="sensor-legend">
            <h3>Sensor Positions:</h3>
            <div className="legend-items">
              {selectedGarden.sensorPositions.map(sensor => (
                <div key={sensor.id} className="legend-item">
                  <div 
                    className="legend-marker" 
                    style={{ backgroundColor: sensor.color }}
                  >
                    {sensor.id}
                  </div>
                  <div className="legend-info">
                    <strong>Sensor {sensor.id}: {sensor.name}</strong>
                    <p>
                      {sensor.name === 'Start' && 'Place at the beginning/entrance of your garden'}
                      {sensor.name === 'Middle' && 'Place in the center for average readings'}
                      {sensor.name === 'End' && 'Place at the far end for complete coverage'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tips-section">
            <h3>💡 Installation Tips:</h3>
            <ul>
              <li>Insert sensors 5-10cm deep into the soil</li>
              <li>Avoid placing near irrigation sources</li>
              <li>Ensure sensors are accessible for maintenance</li>
              <li>Keep sensors away from tree roots and large rocks</li>
              <li>Position in areas representative of your garden's conditions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

