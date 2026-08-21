import * as React from 'react';
import clsx from 'clsx';
import styles from './Currencies.module.scss';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrencies, fetchSingleCoin, Currencies as CurrType } from '../../redux/actions';
import { Chart } from '../Chart/Chart';

// Importujemy oficjalne, stabilne komponenty tabeli z Material-UI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const dispatch = useDispatch();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Pobieramy stany finansowe z globalnego sklepu Redux Store
  const rates = useSelector((state: any) => state['currencies'] || []);
  const chartData = useSelector((state: any) => state['coin'] || []);

  useEffect(() => {
    dispatch(fetchCurrencies() as any);
  }, [dispatch]);

  useEffect(() => {
    if (selectedCurrency) {
      dispatch(fetchSingleCoin(selectedCurrency.toLowerCase()) as any);
    }
  }, [dispatch, selectedCurrency]);

  // Filtrujemy dane na żywo z NBP, wybierając tylko najważniejsze waluty
  const kluczoweWaluty = rates.filter((r: CurrType) => ['USD', 'EUR', 'GBP', 'CHF'].includes(r.code));

  return (
    <div className={clsx(className, styles.root)} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50', fontWeight: 500 }}>
        📊 National Bank of Poland Exchange Rates
      </h3>
      
      {/* NATYWNA, BEZBŁĘDNA TABELA MATERIAL-UI - ODPORNA NA BŁĘDY MAPOWANIA VITE */}
      <TableContainer component={Paper} variant="outlined" style={{ boxShadow: 'none', borderRadius: '8px' }}>
        <Table aria-label="nbp exchange rates table">
          <TableHead style={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold', color: '#34495e' }}>Currency Code</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#34495e' }}>Currency Name</TableCell>
              <TableCell align="right" style={{ fontWeight: 'bold', color: '#34495e' }}>Exchange Rate (PLN)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kluczoweWaluty.map((row: CurrType) => {
              const isSelected = row.code === selectedCurrency;
              return (
                <TableRow 
                  key={row.code}
                  hover
                  onClick={() => setSelectedCurrency(row.code)}
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell component="th" scope="row" style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {row.code}
                  </TableCell>
                  <TableCell style={{ color: '#7f8c8d' }}>
                    {row.currency || (row.code === 'USD' ? 'dolar amerykański' : row.code === 'EUR' ? 'euro' : row.code === 'GBP' ? 'funt szterling' : 'frank szwajcarski')}
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 'bold', color: '#2980b9' }}>
                    {row.mid ? row.mid.toFixed(4) : '0.0000'}
                  </TableCell>
                </TableRow>
              );
            })}
            {kluczoweWaluty.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" style={{ color: '#95a5a6', padding: '20px' }}>
                  ⏳ Loading live exchange rates from NBP servers...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DYNAMICZNY WYKRES TRENDÓW WALUTOWYCH SPARKLINES */}
      {chartData && chartData.length > 0 && (
        <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '15px', color: '#2c3e50', fontStyle: 'italic' }}>
            📈 Trend for Last 20 Quotes: <span style={{ color: '#2980b9', fontStyle: 'normal', fontWeight: 'bold' }}>{selectedCurrency}</span>
          </h4>
          <Chart data={chartData} />
        </div>
      )}
    </div>
  );
};

export { Component as Currencies };
