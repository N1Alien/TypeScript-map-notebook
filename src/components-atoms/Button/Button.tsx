import * as React from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss'

interface Props  {
  onClick: ()=> void;
  text: string;
  className?: string;
  mode?: string;
}

const Component:React.FC<Props> = ( { className, text, onClick, mode }) => {
  return (
    <button className={clsx(className, styles.root, mode ? styles.nav : null)}  onClick={onClick} >
    {text}
  </button>
  )
}

export { 
  Component as Button,
 };
