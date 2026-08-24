import * as React from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import styles from './PostCard.module.scss';
import Post from '../Post/Post';
import { Task } from '../../redux/actions';
import { RootState } from '../../redux/rootReducer';

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const postsData = useSelector((state: RootState) => state.posts ?? []);

  const getItems = (): Task[] => {
    if (Array.isArray(postsData)) {
      return postsData;
    }

    return Object.values(postsData ?? {});
  };

  const kafelki = getItems();

  return (
    <div 
      className={clsx(className, styles.root)} 
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '15px', 
        padding: '20px',
        position: 'relative',
        zIndex: 5
      }}
    >
      {kafelki.map((post: Task, index: number) => {
        const safeId = post && post.id ? String(post.id) : `post-${index}`;
        return <Post data={post} key={safeId} />;
      })}

      {kafelki.length === 0 && (
        <div style={{
          border: '1px dashed #fcee0a',
          padding: '25px',
          textAlign: 'center',
          color: '#fcee0a',
          textTransform: 'uppercase',
          maxWidth: '500px',
          margin: '40px auto',
          background: 'rgba(0,0,0,0.8)',
          boxShadow: '0 0 15px rgba(252, 238, 10, 0.2)'
        }}>
          ⚠️ [GRID_EMPTY] // Mainframe database has 0 active nodes.<br/>
          Initialize a new grid node above to establish the first satellite handshake link!
        </div>
      )}
    </div>
  );
};

export {
  Component as PostCard,
};
