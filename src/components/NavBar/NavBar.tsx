import * as React from 'react';
import clsx from 'clsx';
import styles from './NavBar.module.scss';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { useHistory } from 'react-router-dom';
import  AddTask  from '../AddTask/AddTask';
import { fetchPosts } from '../../redux/actions';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../../components-atoms/Button/Button';

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const history = useHistory();
  const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchPosts());
}, [])

  const handleClick = (destination?: string) => {
    destination ? history.push(`${destination}`) : null;
  };

  return (
    <div className={clsx(className, styles.root)}>
      <AppBar className={styles.bar} position="static" color="primary">
        <Toolbar>
          <Button text="Home" mode="nav" onClick={() => handleClick('/')} />
          <AddTask>AddTask</AddTask>
          <Button text="Currencies" mode="nav" onClick={() => handleClick('/currencies')} />
        </Toolbar>
      </AppBar>
    </div>
  );
};

export {
  Component as NavBar,
};
