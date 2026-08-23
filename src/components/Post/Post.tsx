import * as React from 'react';
import clsx from 'clsx';
import styles from './Post.module.scss';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Task } from '../../redux/actions';
import { ButtonsRadio } from '../ButtonsRadio/ButtonsRadio';
import { useDispatch } from 'react-redux';
import { removePost, editPostAction } from '../../redux/actions';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';

interface Props {
  className?: string;
  data: Task;
}

const Post: React.FC<Props> = ({ className, data }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    let styleForText: React.CSSProperties = {};
    if (data.savedStyle === 'bold') {
      styleForText = { fontWeight: 'bold' };
    } else if (data.savedStyle === 'italic') {
      styleForText = { fontStyle: 'italic' };
    } else if (data.savedStyle === 'underline') {
      styleForText = { textDecoration: 'underline' };
    }
    setStyle(styleForText);
  }, [data.savedStyle]);

  const handleTextBlur = (e: any) => {
    const nowyTekst = e.target.textContent;
    dispatch(editPostAction({ ...data, content: nowyTekst }));

    const baseApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    Axios.put(`${baseApiUrl}/posts/${data.id}`, { ...data, content: nowyTekst })
      .catch(err => console.error(err));
  };

  return (
    <div className={clsx(className, styles.root)} style={{ display: 'inline-block', margin: '15px', verticalAlign: 'top' }}>
      {/* OFICJALNA CYBERPUNKOWA KARTA KONTROLI ZADAŃ - SOCZYSTY ŻÓŁTY I CZERŃ */}
      <Card 
        style={{ 
          backgroundColor: '#fcee0a', // Oficjalny żółty kolor Cyberpunk 2077
          color: '#000000', 
          borderRadius: '0px', 
          width: '280px',
          borderLeft: '5px solid #000000',
          borderBottom: '4px solid #ff0055',
          boxShadow: '0px 0px 10px rgba(252, 238, 10, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Dekoracyjny trójkąt militarny w rogu karty */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 20px 20px 0',
          borderColor: `transparent #ff0055 transparent transparent`
        }} />

        <CardActionArea>
          <CardContent style={{ padding: '15px' }}>
            {/* Nagłówek ID zadania */}
            <h5 style={{ 
              margin: '0 0 10px 0', 
              fontFamily: "'Share Tech Mono', monospace", 
              fontSize: '1rem', 
              backgroundColor: '#000', 
              color: '#fcee0a', 
              display: 'inline-block', 
              padding: '2px 8px',
              letterSpacing: '1px'
            }}>
              DATA_CHKP // {data.id}
            </h5>
            
            <div style={{ marginTop: '10px' }}>
              {/* Przełączniki B, I, U stylizowane na neonowe kropki */}
              <div style={{ marginBottom: '10px', opacity: 0.85 }}>
                <ButtonsRadio id={data.id} />
              </div>

              {/* Treść zadania - Edytowalna na żywo z zapisem do Neon SQL */}
              <Typography
                variant="body1"
                component="p"
                contentEditable
                suppressContentEditableWarning={true}
                style={{ 
                  ...style, 
                  fontFamily: "'Share Tech Mono', monospace", 
                  fontSize: '1.2rem', 
                  color: '#000',
                  padding: '5px',
                  background: 'rgba(0,0,0,0.03)',
                  borderLeft: '2px solid #ff0055',
                  minHeight: '40px',
                  outline: 'none'
                }}
                onBlur={handleTextBlur}
              >
                {data.content}
              </Typography>
            </div>
          </CardContent>
        </CardActionArea>

        {/* AKCJE KARTY: Remove oraz Details jako surowe przyciski terminalowe */}
        <CardActions style={{ justifyContent: 'space-between', padding: '10px 15px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => dispatch(removePost(data.id) as any)}
            style={{
              background: '#000000',
              color: '#ff0055',
              border: 'none',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.9rem',
              fontWeight: 'bold',
              padding: '5px 12px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            [ REMOVE ]
          </button>
          
          <button 
            onClick={() => history.push(`/post/${data.id}`)}
            style={{
              background: '#000000',
              color: '#00f0ff',
              border: 'none',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.9rem',
              fontWeight: 'bold',
              padding: '5px 12px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            [ DETAILS  ---]
          </button>
        </CardActions>
      </Card>
    </div>
  );
};

export default Post;
