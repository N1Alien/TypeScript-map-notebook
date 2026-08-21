import React from 'react';
import clsx from 'clsx';
import styles from './Table.module.scss';
import TableHeader from './TableHeader';
import TableRows from './TableRows';

interface Currency {
  currency: string;
  mid: number;
  code: string;
}

export interface ColumnDefinition {
  key: string;
  header: string;
}

export interface TableProps {
  data: Array<Currency>;
  columns: Array<ColumnDefinition>;
  className?: string;
}

const Table = ({ data, columns, className }: TableProps): JSX.Element => {
  return (
    <table className={clsx(className, styles.root)}>
      <TableHeader columns={columns} />
      <TableRows data={data} columns={columns} />
    </table>
  );
};

export default Table;
