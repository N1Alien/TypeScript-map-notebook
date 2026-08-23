import * as React from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import styles from './PostCard.module.scss';
import Post from '../Post/Post';
import { Task } from '../../redux/actions';

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const posts = useSelector((state: any) => state);
  let items: Array<any>;
  
  const getItems = () => {
    const list = posts && posts['posts'] ? posts['posts'] : [];
    items = Object.values(list);
    return items;
  };

  return (
    <div 
      className={clsx(className, styles.root)} 
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '10px', 
        padding: '20px',
        position: 'relative',
        zIndex: 5
      }}
    >
      {getItems().map((post: Task) => (
        <Post data={post} key={post.id}/>
      ))}
    </div>
  );
};

export {
  Component as PostCard,
};
