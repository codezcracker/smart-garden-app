'use client';
import { useState, useEffect } from 'react';

export default function AnimatedChart({ data, type = 'line', color = '#4caf50', height = 100 }) {
  const [animatedData, setAnimatedData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsAnimating(true);
      // Animate data points one by one
      const animateData = data.map((value, index) => ({
        value: 0,
        originalValue: value,
        index
      }));
      
      setAnimatedData(animateData);
      
      // Animate each point with delay
      animateData.forEach((point, index) => {
        setTimeout(() => {
          setAnimatedData(prev => prev.map((item, i) => 
            i === index ? { ...item, value: item.originalValue } : item
          ));
        }, index * 100);
      });
      
      setTimeout(() => setIsAnimating(false), data.length * 100);
    }
  }, [data]);

  const maxValue = Math.max(...(data || [0]));
  const minValue = Math.min(...(data || [0]));

  if (type === 'line') {
    return (
      <div className="animated-chart line-chart" style={{ height }}>
        <svg width="100%" height="100%" viewBox="0 0 300 100">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="300"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
          
          {/* Data line */}
          {animatedData.length > 1 && (
            <path
              d={`M 0,${100 - (animatedData[0].value / maxValue) * 100} ${animatedData.map((point, index) => 
                `L ${(index / (animatedData.length - 1)) * 300},${100 - (point.value / maxValue) * 100}`
              ).join(' ')}`}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isAnimating ? 'chart-line-animate' : ''}
            />
          )}
          
          {/* Data points */}
          {animatedData.map((point, index) => (
            <circle
              key={index}
              cx={(index / (animatedData.length - 1)) * 300}
              cy={100 - (point.value / maxValue) * 100}
              r="4"
              fill={color}
              className={isAnimating ? 'chart-point-animate' : ''}
            />
          ))}
          
          {/* Area fill */}
          {animatedData.length > 1 && (
            <path
              d={`M 0,${100 - (animatedData[0].value / maxValue) * 100} ${animatedData.map((point, index) => 
                `L ${(index / (animatedData.length - 1)) * 300},${100 - (point.value / maxValue) * 100}`
              ).join(' ')} L 300,100 L 0,100 Z`}
              fill={`url(#gradient-${color})`}
              opacity="0.3"
              className={isAnimating ? 'chart-area-animate' : ''}
            />
          )}
        </svg>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="animated-chart bar-chart" style={{ height }}>
        <div className="bar-container">
          {animatedData.map((point, index) => (
            <div
              key={index}
              className="bar-item"
              style={{
                height: `${(point.value / maxValue) * 100}%`,
                backgroundColor: color,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <span className="bar-value">{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
