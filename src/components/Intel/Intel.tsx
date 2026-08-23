import * as React from 'react';
import clsx from 'clsx';
import styles from './Intel.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/actions';

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  // POPRAWKA: Precyzyjnie wyciągamy obiekt intel przy użyciu struktury RootState
  const intel = useSelector((state: RootState) => state.intel);

  let countryData: any = null;
  if (intel) {
    countryData = Array.isArray(intel) ? intel : intel;
  }

  if (!countryData || !countryData.name || countryData.name === 'Unknown') {
    return (
      <div style={{ 
        border: '1px dashed #00f0ff', 
        padding: '20px', 
        textAlign: 'center', 
        marginTop: '20px',
        color: '#00f0ff',
        textTransform: 'uppercase'
      }}>
        📡 [SYSTEM_STATUS] STANDBY // Awaiting satellite uplink marker on the grid...
      </div>
    );
  }

  return (
    <div 
      className={clsx(className, styles.root)} 
      style={{ 
        backgroundColor: '#050505',
        border: '2px solid #00f0ff', 
        borderRadius: '0px', 
        marginTop: '20px',
        padding: '25px',
        boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
        animation: 'neonGlow 4s infinite'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          border: '2px solid #ff0055', 
          padding: '6px', 
          background: '#000',
          boxShadow: '0 0 8px #ff0055'
        }}>
          <img src={countryData.flag} alt="matrix-flag" style={{ maxWidth: '160px', height: 'auto', display: 'block' }} />
        </div>

        <div style={{ flex: 1, minWidth: '250px', color: '#fff', fontSize: '1.1rem', textTransform: 'uppercase' }}>
          <div style={{ color: '#fcee0a', fontWeight: 'bold', fontSize: '1.4rem', borderBottom: '1px solid #fcee0a', paddingBottom: '5px', marginBottom: '10px' }}>
            🛰️ TARGET_DATA // {countryData.name}
          </div>
          <p style={{ margin: '5px 0' }}><span style={{ color: '#00f0ff' }}>ZONE_SUBREGION:</span> {countryData.subregion}</p>
          <p style={{ margin: '5px 0' }}><span style={{ color: '#00f0ff' }}>NATIVE_CYPHER:</span> {countryData.nativeName}</p>
          <p style={{ margin: '5px 0' }}><span style={{ color: '#00f0ff' }}>POLITICAL_CORE:</span> {countryData.capital}</p>
          <p style={{ margin: '5px 0' }}><span style={{ color: '#00f0ff' }}>CREDIT_CURRENCY:</span> {countryData.currencies?.name || 'N/A'}</p>
          <p style={{ margin: '5px 0' }}><span style={{ color: '#00f0ff' }}>LINK_LANGUAGE:</span> {countryData.languages?.name || 'N/A'}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button
          onClick={() => {
            const s = String.fromCharCode(47);
            const countryCleanName = String(countryData.name).trim();
            const formattedName = countryCleanName.charAt(0).toUpperCase() + countryCleanName.slice(1);
            const ostatecznyUrlWiki = "https:" + s + s + "en.wikipedia.org" + s + "wiki" + s + formattedName;
            window.open(ostatecznyUrlWiki, '_blank');
          }}
          style={{
            background: '#ff0055',
            color: '#fff',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '1.1rem',
            fontWeight: 'bold',
            padding: '10px 30px',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 0 10px #ff0055',
            transition: 'transform 0.1s'
          }}
        >
          NET_MATRIX_SEARCH [WIKIPEDIA]
        </button>
      </div>
    </div>
  );
};

export { Component as Intel };
