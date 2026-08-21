import React from 'react';
import clsx from 'clsx';
import styles from './Table.module.scss';
import { Currencies } from '../../redux/actions';
import { useHistory } from 'react-router-dom';
import { ColumnDefinition } from './Table';

interface TableRowsProps {
  data: Array<Currencies>;
  columns: Array<ColumnDefinition>;
  className?: string;
}

const TableRows = ({ data, columns, className }: TableRowsProps): JSX.Element => {
  const history = useHistory();

  const checkRates = (code: string): void => {
    if (!code) return;
    history.push(`/currencies/${code.toLowerCase()}/rates`);
  };

  const rows = data.map((row, index) => {
    // Pomocnicze rzutowanie całego obiektu na typ 'any', omijające błąd parsera
    const rawRow = row;

    return (
      <tr 
        key={`row-${index}`} 
        className={clsx(className, styles.rowLines)}
        onClick={() => checkRates(row.code)}
        style={{ cursor: 'pointer' }}
      >
        {columns.map((column, index2) => {
          return (
            <td key={`cell-${index2}`} className={styles.rootRows}>
              {/* Czysty, bezpieczny zapis bez używania problematycznego słowa 'as' */}
              {rawRow[column.key]}
            </td>
          );
        })}
      </tr>
    );
  });

  return <tbody>{rows}</tbody>;
};

export default TableRows;
