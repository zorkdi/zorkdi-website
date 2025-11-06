// src/components/AnimatedBackground/AnimatedBackground.tsx

"use client";

import React, { useEffect } from 'react'; 

// CSS for the animated background
const backgroundStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  zIndex: -1, // Ensure it stays behind everything
  overflow: 'hidden',
  pointerEvents: 'none',
  // Basic animated background using CSS keyframes
  background: 'linear-gradient(135deg, var(--color-dark-navy) 0%, var(--color-deep-blue) 100%)',
};

// CSS for the subtle vertical streaming lines (High-Tech, low opacity)
const lineStyles = (delay: string, duration: string): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: `${Math.random() * 100}%`, // Random horizontal starting position
  // FIX 1: Width 1px kiya for fine lines
  width: '1px', 
  height: '100%',
  // FIX 2: Soft white color for subtle tech look
  background: 'rgba(255, 255, 255, 0.5)', 
  opacity: 0,
  // FIX 3: Tech Stream animation
  animation: `techStream ${duration} infinite linear ${delay}`, 
});

// FIX 4: Keyframes for subtle, vertical data stream
const globalKeyframes = `
@keyframes techStream {
  0% {
    /* Bottom se shuru */
    transform: translateY(100vh) scaleY(0.01); 
    opacity: 0;
  }
  1% {
    /* Immediately start opacity */
    opacity: 0.1;
  }
  50% {
    /* Top par pahunchna */
    transform: translateY(-100vh) scaleY(0.8); 
    opacity: 0.05; /* FIX: Maximum opacity bahut kam rakha (Subtle) */
  }
  100% {
    transform: translateY(-100vh) scaleY(0.01);
    opacity: 0;
  }
}
`;


const AnimatedBackground = () => {
  // We need to inject the keyframes once globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const style = document.createElement('style');
        style.innerHTML = globalKeyframes;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }
  }, []);


  // FIX 5: Lines ki sankhya badhayi (Density increase)
  const numLines = 80; // High density for tech grid feel
  const lines = Array.from({ length: numLines }).map((_, index) => {
    const randomDelay = `${Math.random() * 8}s`; // Max delay 8s
    const randomDuration = `${10 + Math.random() * 15}s`; // Duration 10s to 25s (Slow to medium flow)

    return (
        <div
            key={index}
            style={lineStyles(randomDelay, randomDuration)}
        />
    );
  });

  return (
    <div style={backgroundStyles}>
        {/* NAYA: Isme thoda aur central glow diya */}
        <div style={{
            position: 'absolute',
            width: '100%', height: '100%',
            // Soft inner glow, purple to neon fade (opacity kam rakhi)
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.04) 0%, rgba(0, 245, 200, 0.01) 30%, transparent 60%)', 
        }}/>
      {lines}
    </div>
  );
};

export default AnimatedBackground;