import * as React from 'react';
import clsx from 'clsx';
import styles from './Input.module.scss';

interface Props {
  className?: string;
  label?: string;
  onChange: any;
  value: string;
  placeholder?: string;
}

const Component: React.FC<Props> = ({ className, label, onChange, value, placeholder }) => {
  return (
    <div className={clsx(className, styles.root)}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} type="text" onChange={onChange} value={value} placeholder={placeholder}/>
    </div>
  );
};

export { Component as Input };
