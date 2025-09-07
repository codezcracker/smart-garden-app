'use client';
import { useState, useEffect } from 'react';

export default function AnimatedProgressBar({ 
  value, 
  max = 100, 
  color = '#4caf50', 
  label, 
  unit = '%',
  showValue = true,
  animated = true 
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const duration = 1500; // 1.5 seconds
      const steps = 60;
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
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated]);

  const percentage = (animatedValue / max) * 100;
  const isHigh = percentage > 80;
  const isLow = percentage < 30;

  return (
    <div className="animated-progress-container">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        {showValue && (
          <span className="progress-value">
            {Math.round(animatedValue)}{unit}
          </span>
        )}
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{
            background: `linear-gradient(90deg, 
              ${color} 0%, 
              ${color} ${percentage}%, 
              #e5e7eb ${percentage}%, 
              #e5e7eb 100%)`
          }}
        >
          <div 
            className="progress-fill"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd)`,
              boxShadow: isAnimating ? `0 0 20px ${color}40` : 'none'
            }}
          >
            <div className="progress-glow"></div>
          </div>
        </div>
        
        {/* Animated dots */}
        {isAnimating && (
          <div className="progress-dots">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="progress-dot"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  backgroundColor: color
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      <div className="progress-status">
        {isHigh && <span className="status-high">High</span>}
        {isLow && <span className="status-low">Low</span>}
        {!isHigh && !isLow && <span className="status-normal">Normal</span>}
      </div>
    </div>
  );
}
