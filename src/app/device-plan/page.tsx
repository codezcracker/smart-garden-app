'use client';

import { useState } from 'react';
import './device-plan.css';

export default function DevicePlanPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');

  const currentComponents = [
    { 
      category: 'Power', 
      component: '18650 Li-ion battery', 
      purpose: 'Main power source (3.0–4.2V)',
      icon: '🔋'
    },
    { 
      category: 'Power', 
      component: 'BMS 1S protection board', 
      purpose: 'Battery protection (overcharge/discharge)',
      icon: '🛡️'
    },
    { 
      category: 'Power', 
      component: 'Techtonics 1.5V to 5V DC-DC Boost Converter', 
      purpose: 'Step-up voltage for ESP or other modules',
      icon: '⚡'
    },
    { 
      category: 'MCU / Main', 
      component: '2B4 ESP8266 ESP-12 D1 Mini NodeMCU', 
      purpose: 'Microcontroller + WiFi',
      icon: '💻'
    },
    { 
      category: 'Sensors', 
      component: 'DHT22 (or DHT11)', 
      purpose: 'Temperature & humidity',
      icon: '🌡️'
    },
    { 
      category: 'Sensors', 
      component: 'LDR + 10kΩ resistor', 
      purpose: 'Light intensity measurement',
      icon: '💡'
    },
    { 
      category: 'Sensors', 
      component: 'Soil moisture sensor (analog)', 
      purpose: 'Soil wet/dry monitoring',
      icon: '💧'
    },
    { 
      category: 'Actuators', 
      component: 'LED + 220Ω resistor', 
      purpose: 'Status / indicator light',
      icon: '💡'
    },
    { 
      category: 'Actuators', 
      component: 'RGB LED', 
      purpose: 'Multi-color indicator',
      icon: '🌈'
    },
    { 
      category: 'Actuators', 
      component: 'Buzzer (active type)', 
      purpose: 'Alerts / notifications',
      icon: '🔔'
    },
    { 
      category: 'Input', 
      component: 'Push button (with pull-up resistor)', 
      purpose: 'Manual reset / trigger input',
      icon: '🔘'
    },
    { 
      category: 'Misc.', 
      component: 'Wires, resistors (220Ω, 10kΩ), breadboard / PCB', 
      purpose: 'Basic wiring and prototyping',
      icon: '🔌'
    }
  ];

  const futureComponents = [
    { 
      category: 'MCU / Main', 
      component: 'ADS1115 ADC module', 
      purpose: 'High-resolution analog readings (for pH/EC/etc.)',
      icon: '📊'
    },
    { 
      category: 'Sensors', 
      component: 'pH sensor', 
      purpose: 'Soil acidity/alkalinity monitoring',
      icon: '🧪'
    },
    { 
      category: 'Sensors', 
      component: 'EC sensor', 
      purpose: 'Soil nutrient measurement',
      icon: '⚗️'
    },
    { 
      category: 'Sensors', 
      component: 'MH-Z19 CO₂ sensor', 
      purpose: 'Air CO₂ measurement',
      icon: '🌬️'
    },
    { 
      category: 'Actuators', 
      component: 'Additional RGB or status LEDs', 
      purpose: 'Visual multi-state indicators',
      icon: '💫'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Power': '#ff6b6b',
      'MCU / Main': '#4ecdc4',
      'Sensors': '#45b7d1',
      'Actuators': '#96ceb4',
      'Input': '#feca57',
      'Misc.': '#ff9ff3'
    };
    return colors[category] || '#95a5a6';
  };

  const renderTable = (components: any[], title: string) => (
    <div className="table-container">
      <h2 className="table-title">{title}</h2>
      <div className="table-wrapper">
        <table className="components-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Category</th>
              <th>Component</th>
              <th>Purpose / Notes</th>
            </tr>
          </thead>
          <tbody>
            {components.map((item, index) => (
              <tr key={index}>
                <td className="component-image-cell">
                  <div 
                    className="component-image"
                    style={{
                      fontSize: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={item.component}
                  >
                    {item.icon}
                  </div>
                </td>
                <td>
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="component-name">{item.component}</td>
                <td className="component-purpose">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="device-plan-page">
      <div className="page-header">
        <h1>🔧 Smart Garden IoT Device Components</h1>
        <p>Design and plan your IoT device with current and future components</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            📋 Current Implementation ({currentComponents.length} components)
          </button>
          <button 
            className={`tab ${activeTab === 'future' ? 'active' : ''}`}
            onClick={() => setActiveTab('future')}
          >
            🚀 Future Enhancements ({futureComponents.length} components)
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'current' && renderTable(currentComponents, 'Current Implementation')}
          {activeTab === 'future' && renderTable(futureComponents, 'Future Enhancements')}
        </div>
      </div>

      <div className="summary-section">
        <h3>📊 Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Current Device (V1)</h4>
            <ul>
              <li><strong>Components:</strong> {currentComponents.length} items</li>
              <li><strong>Cost:</strong> ~$25-35</li>
              <li><strong>Build Time:</strong> 2-4 hours</li>
              <li><strong>Difficulty:</strong> Beginner</li>
              <li><strong>Power:</strong> Battery powered</li>
              <li><strong>Sensors:</strong> Basic environmental monitoring</li>
            </ul>
          </div>
          <div className="summary-card">
            <h4>Future Device (V2)</h4>
            <ul>
              <li><strong>Components:</strong> {currentComponents.length + futureComponents.length} items</li>
              <li><strong>Cost:</strong> ~$75-100</li>
              <li><strong>Build Time:</strong> 4-6 hours</li>
              <li><strong>Difficulty:</strong> Intermediate</li>
              <li><strong>Power:</strong> May need external power</li>
              <li><strong>Sensors:</strong> Advanced soil analysis + environmental monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

