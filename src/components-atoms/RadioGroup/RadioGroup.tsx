import * as React from 'react';
import clsx from 'clsx';
import styles from './RadioGroup.module.scss';
import { ReactNode } from 'react';

interface Props {
  className?: string;
  onChange: (e: React.FormEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

const Component: React.FC<Props> = ({ className, onChange, children }) => {
  return (
    <div className={clsx(className, styles.root)} onChange={onChange}>
      {children}
    </div>
  );
};

export { Component as RadioGroup };
