import * as React from 'react';
import clsx from 'clsx';
import { Currencies } from '../../redux/actions';

interface Props {
  className?: string;
  data: Currencies[];
  onRowClick?: (row: Currencies) => void;
  selectedCode?: string;
}

const TableRows: React.FC<Props> = ({ className, data, onRowClick, selectedCode }) => {
  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((row: Currencies) => {
        // POPRAWKA TYPESCRIPT: Rzutujemy obiekt na 'any', aby dynamiczne indeksowanie kluczem string (np. row.code) 
        // nie wywoływało błędu TS7053 w trakcie npm run build!
        const r = row as any;
        const isSelected = r.code === selectedCode;

        return (
          <tr
            key={r.code || Math.random()}
            onClick={() => onRowClick && onRowClick(row)}
            style={{ cursor: 'pointer', backgroundColor: isSelected ? '#e3f2fd' : 'transparent' }}
          >
            <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: isSelected ? 'bold' : 'normal' }}>
              {r.code}
            </td>
            <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#7f8c8d' }}>
              {r.currency || (r.code === 'USD' ? 'dolar amerykański' : r.code === 'EUR' ? 'euro' : r.code === 'GBP' ? 'funt szterling' : 'frank szwajcarski')}
            </td>
            <td align="right" style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#2980b9' }}>
              {r.mid ? r.mid.toFixed(4) : '0.0000'}
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default TableRows;
