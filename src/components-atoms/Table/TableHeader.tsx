import React from 'react';
import clsx from 'clsx';
import styles from './Table.module.scss';
import { ColumnDefinition } from './Table';

interface TableHeaderProps {
  columns: Array<ColumnDefinition>;
  className?: string;
}

const TableHeader = ({ columns, className }: TableHeaderProps): JSX.Element => {
  const headers = columns.map((column, index) => {
    return (
      <th key={`headCell-${index}`} className={clsx(className, styles.rootHeader)}>
        {column.header}
      </th>
    );
  });

  return (
    <thead>
      <tr>{headers}</tr>
    </thead>
  );
};

export default TableHeader;
