import * as React from 'react';
import clsx from 'clsx';
import styles from './Chart.module.scss';

interface Props {
  className?: string;
  data: any[]; // Tablica 20 ostatnich notowań z NBP (np. obiekty z polem .mid lub .mid)
}

const Component: React.FC<Props> = ({ className, data }) => {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', color: '#7f8c8d' }}>No historical data available.</div>;
  }

  // Wyciągamy same wartości kursów walut (w zależności od tego, jak NBP nazywa pole w JSONIE: 'mid' lub 'mid')
  const kursy: number[] = data.map((item: any) => item.mid || item.mid || 0).filter(v => v > 0);

  if (kursy.length === 0) {
    return <div style={{ textAlign: 'center', color: '#7f8c8d' }}>Invalid financial data structure.</div>;
  }

  // Algorytm automatycznego skalowania wykresu SVG do wielkości kontenera
  const minKurs = Math.min(...kursy);
  const maxKurs = Math.max(...kursy);
  const zakres = maxKurs - minKurs === 0 ? 1 : maxKurs - minKurs;

  const szerokoscWykresu = 500;
  const wysokoscWykresu = 150;
  const margines = 10;

  // Mapujemy punkty finansowe na współrzędne pikseli X i Y na wykresie
  const punktySVG = kursy.map((kurs, index) => {
    const x = (index / (kursy.length - 1)) * (szerokoscWykresu - margines * 2) + margines;
    const y = wysokoscWykresu - ((kurs - minKurs) / zakres) * (wysokoscWykresu - margines * 2) - margines;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={clsx(className, styles.root)} style={{ textAlign: 'center', padding: '10px' }}>
      <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: `${szerokoscWykresu}px` }}>
        {/* Rysujemy dynamiczny, ultraszybki wykres wektorowy Sparkline przy użyciu natywnego SVG */}
        <svg 
          viewBox={`0 0 ${szerokoscWykresu} ${wysokoscWykresu}`} 
          style={{ width: '100%', height: 'auto', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e2e8f0' }}
        >
          {/* Siatka pomocnicza wykresu */}
          <line x1="0" y1={wysokoscWykresu / 2} x2={szerokoscWykresu} y2={wysokoscWykresu / 2} stroke="#e2e8f0" strokeDasharray="5,5" />
          
          {/* Główna linia trendu walutowego */}
          <polyline
            fill="none"
            stroke="#2980b9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={punktySVG}
          />

          {/* Czerwona kropka oznaczająca ostatnie, najświeższe notowanie z NBP */}
          {kursy.length > 0 && (
            <circle
              cx={(szerokoscWykresu - margines)}
              cy={wysokoscWykresu - ((kursy[kursy.length - 1] - minKurs) / zakres) * (wysokoscWykresu - margines * 2) - margines}
              r="5"
              fill="#e74c3c"
            />
          )}
        </svg>

        {/* Wskaźniki wartości minimalnej i maksymalnej na osi wykresu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.85rem', color: '#7f8c8d' }}>
          <span>Min: {minKurs.toFixed(4)} PLN</span>
          <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Current: {kursy[kursy.length - 1].toFixed(4)} PLN</span>
          <span>Max: {maxKurs.toFixed(4)} PLN</span>
        </div>
      </div>
    </div>
  );
};

export { Component as Chart };
