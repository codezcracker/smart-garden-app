'use client';
import { useState, useEffect } from 'react';

export default function AnimatedGauge({ 
  value, 
  max = 100, 
  color = '#4caf50', 
  label, 
  unit = '%',
  size = 120 
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const steps = 100;
    const stepDuration = duration / steps;
    const increment = value / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedValue(Math.min(increment * currentStep, value));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setIsAnimating(false);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);

  const percentage = (animatedValue / max) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getGaugeColor = () => {
    if (percentage < 30) return '#ef4444';
    if (percentage < 70) return '#f59e0b';
    return color;
  };

  return (
    <div className="animated-gauge" style={{ width: size, height: size }}>
      <div className="gauge-container">
        <svg width={size} height={size} viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={getGaugeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className={isAnimating ? 'gauge-progress-animate' : ''}
            style={{
              filter: isAnimating ? `drop-shadow(0 0 10px ${getGaugeColor()}40)` : 'none'
            }}
          />
          
          {/* Center text */}
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            className="gauge-value"
            style={{ fill: getGaugeColor() }}
          >
            {Math.round(animatedValue)}
          </text>
          
          {/* Unit text */}
          <text
            x="60"
            y="75"
            textAnchor="middle"
            dominantBaseline="middle"
            className="gauge-unit"
          >
            {unit}
          </text>
        </svg>
        
        {/* Animated particles */}
        {isAnimating && (
          <div className="gauge-particles">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="gauge-particle"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  backgroundColor: getGaugeColor()
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="gauge-label">{label}</div>
    </div>
  );
}
