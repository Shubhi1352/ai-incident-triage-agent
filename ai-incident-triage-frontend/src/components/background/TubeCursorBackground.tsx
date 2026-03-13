// src/components/TubeCursorBackground.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import styles from './TubeCursorBackground.module.css';
import { useColors } from '@/contexts/ColorContext';

declare global {
    interface Window {
        changeTubeColors?: () => void;
        updateTubeColors?: (colors: string[], lightColors: string[]) => void;
    }
}

const TubeCursorBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { primaryColor, secondaryColor, tertiaryColor, lightColors, changeColors } = useColors();

  useEffect(() => {
    if (!canvasRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      const moduleScript = document.createElement('script');
      moduleScript.type = 'module';
      moduleScript.innerHTML = `
        import TubesCursor from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
        const app = TubesCursor(document.getElementById('tube-canvas'), {
          tubes: {
            colors: ["${primaryColor}", "${secondaryColor}}", "${tertiaryColor}"],
            lights: {
              intensity: 200,
              colors: ["${lightColors.join('", "')}"]
            }
          }
        });

        window.updateTubeColors = (colors, lightColors) => {
          app.tubes.setColors(colors);
          app.tubes.setLightsColors(lightColors);
        };
        
        document.body.addEventListener('click', () => {
          if(window.changeTubeColors){
            window.changeTubeColors();
          }
        });
      `;
      document.body.appendChild(moduleScript);
    };
    
    document.body.appendChild(script);

    window.changeTubeColors = changeColors;

    return () => {
      document.body.removeChild(script);
      delete window.changeTubeColors;
      delete window.updateTubeColors;
    };
  }, []);

  useEffect(() => {
    if (window.updateTubeColors) {
      window.updateTubeColors([primaryColor, secondaryColor, tertiaryColor], lightColors);
    }
  }, [primaryColor, secondaryColor, tertiaryColor, lightColors]);


  return (
    <div className={styles.background}>
      <canvas ref={canvasRef} id="tube-canvas" className={styles.canvas} />
    </div>
  );
};

export default TubeCursorBackground;