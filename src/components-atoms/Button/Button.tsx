import * as React from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss';

interface Props {
  className?: string;
  text: string;
  onClick?: () => void;
  mode?: 'default' | 'nav'; // Obsługa dodatkowych trybów, jeśli były w kodzie
}

const Component: React.FC<Props> = ({ className, text, onClick, mode }) => {
  // Nadpisujemy stary, zaokrąglony styl na ostry i neonowy
  const isNav = mode === 'nav';

  return (
    <button
      onClick={onClick}
      className={clsx(className, styles.root)}
      style={{
        background: isNav ? '#fcee0a' : '#000000',
        color: isNav ? '#000000' : '#00f0ff',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '1rem',
        fontWeight: 'bold',
        padding: '8px 20px',
        // KLUCZ: Likwidujemy zaokrąglenie pigułki (border-radius: 0)
        borderRadius: '0px', 
        border: isNav ? 'none' : '1px solid #00f0ff',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        boxShadow: isNav ? '0 0 10px rgba(252, 238, 10, 0.4)' : '0 0 8px rgba(0, 240, 255, 0.3)',
        transition: 'all 0.15s ease-in-out',
        margin: '5px'
      }}
      onMouseEnter={(e) => {
        if (!isNav) {
          e.currentTarget.style.background = '#00f0ff';
          e.currentTarget.style.color = '#000000';
          e.currentTarget.style.boxShadow = '0 0 15px #00f0ff';
        } else {
          e.currentTarget.style.background = '#000000';
          e.currentTarget.style.color = '#fcee0a';
          e.currentTarget.style.border = '1px solid #fcee0a';
        }
      }}
      onMouseLeave={(e) => {
        if (!isNav) {
          e.currentTarget.style.background = '#000000';
          e.currentTarget.style.color = '#00f0ff';
          e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 240, 255, 0.3)';
        } else {
          e.currentTarget.style.background = '#fcee0a';
          e.currentTarget.style.color = '#000000';
          e.currentTarget.style.border = 'none';
        }
      }}
    >
      {/* Formatujemy tekst na hakerski styl komendy */}
      {isNav ? `[ ${text} ]` : `// ${text}`}
    </button>
  );
};

export { Component as Button };
