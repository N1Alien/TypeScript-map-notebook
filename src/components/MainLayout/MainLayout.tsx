import * as React from 'react';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './MainLayout.module.scss';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const Component: React.FC<Props> = ({ children, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  console.log("MainLayout component rendered. Children:", children);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const alphabet = "𖤓𖦹𖨆𖠋🧬⚡☠☣☢⚙🛠⛓⚙010110011001010110101101";
    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops: number[] = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00f0ff'; 
      ctx.font = fontSize + 'px Share Tech Mono, monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 30);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={clsx(className, styles.root)} style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 0, 
          pointerEvents: 'none',
          opacity: 0.15 
        }} 
      />

      {/* CZYSTY I SYMETRYCZNY PASEK HUD PO USUNIĘCIU PRZYCISKU Z LEWEJ STRONY */}
      <header style={{ 
        position: 'relative', 
        zIndex: 10, 
        background: '#050505', 
        borderBottom: '3px solid #fcee0a', 
        padding: '12px 30px',
        boxShadow: '0 4px 20px rgba(252, 238, 10, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fcee0a', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '2px 2px #ff0055' }}>
          Cyber_Deck // Netwatch_OS_v2.077
        </div>
        
        {/* TEKST STRUMIENIOWY BLACKWALL */}
        <div style={{ 
          color: '#ff0055', 
          fontSize: '1.1rem', 
          letterSpacing: '2px', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          border: '1px dashed #ff0055',
          padding: '4px 12px',
          boxShadow: '0 0 8px rgba(255, 0, 85, 0.3)',
          animation: 'cyberPulse 1.5s infinite'
        }}>
          [ ACCESS_TO_BLACKWALL: GRANTED // LINK_STABLE ]
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 5, padding: '30px', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
};

export { Component as MainLayout };
