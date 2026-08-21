import * as React from 'react';
import clsx from 'clsx';
import styles from './Radio.module.scss';

interface Props {
  className?: string;
  text: string;
  value: string;
  checked?: boolean;
  onChange?: ()=> void;
}

const Component: React.FC<Props> = ({ className, text, value, checked, onChange }) => {
  return (
    <div className={clsx(className, styles.root)}>
      <div className={styles.container}>
        <input
          type="radio"
          className={styles.checkmark}
          value={value}
          checked={checked}
          onChange={onChange}
        />
        <p>{text}</p>
      </div>
    </div>
  );
};

export { Component as Radio };
