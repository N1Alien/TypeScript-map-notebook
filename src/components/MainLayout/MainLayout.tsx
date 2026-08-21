import * as React from 'react';
import { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './MainLayout.module.scss'

interface Props  {
  children: ReactNode;
  className?: string;
}

const Component:React.FC<Props> = ( { className, children }) => {
  return (
  <div className={clsx(className, styles.root)}>
  {children}
  </div>
  )
}

export { 
  Component as MainLayout,
 };
