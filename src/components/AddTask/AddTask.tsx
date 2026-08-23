import React, { ChangeEvent, useState } from 'react';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { addPost } from '../../redux/actions';
import styles from './AddTask.module.scss';

interface Props {
  className?: string;
}

const AddTask: React.FC<Props> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const dispatch = useDispatch();

  const updateNote = (event: ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const onAddNoteClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const randomId = Math.floor(Math.random() * 1000) + 1;
    // Rzutujemy na any, aby Thunk przeszedł bez ograniczeń sprawdzania typów Strict
    dispatch(addPost(randomId, content, "default") as any);
    
    setContent('');
    setOpen(false);
  };

  return (
    <div className={clsx(className, styles.root)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', position: 'relative', zIndex: 100 }}>
      
      {/* GLÓWNY PRZYCISK TERMINALA NETWATCH */}
      {!open ? (
        <button 
          onClick={() => setOpen(true)}
          style={{
            background: '#fcee0a',
            color: '#000000',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '1.2rem',
            fontWeight: 'bold',
            padding: '12px 35px',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 0 15px rgba(252, 238, 10, 0.4)',
            borderLeft: '5px solid #ff0055'
          }}
        >
          [ + INITIALIZE_NEW_GRID_NODE ]
        </button>
      ) : (
        /* PANCERNY FORMULARZ TERMINALOWY - ZERO UKRYTYCH STRZAŁÓW DO GOOGLE */
        <form 
          onSubmit={onAddNoteClick}
          style={{
            backgroundColor: '#050505',
            border: '2px solid #00f0ff',
            padding: '25px',
            boxShadow: '0 0 25px #00f0ff',
            width: '100%',
            maxWidth: '500px',
            boxSizing: 'border-box',
            fontFamily: "'Share Tech Mono', monospace"
          }}
        >
          <h2 style={{ color: '#fcee0a', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.4rem', borderBottom: '1px solid #fcee0a', paddingBottom: '5px' }}>
            // COGNITIVE_INJECTION_INTERFACE
          </h2>
          
          <p style={{ color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 15px 0', lineHeight: '1.4' }}>
            "A journey of a thousand miles begins with a single network handshake."
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#00f0ff', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              INPUT_TARGET_IDEA_DATA:
            </label>
            <input
              type="text"
              onChange={updateNote}
              value={content}
              placeholder="Inject string to the mainframe..."
              autoFocus
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#111',
                border: '1px solid #ff0055',
                color: '#fff',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '1.1rem',
                padding: '12px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              type="button"
              onClick={() => { setOpen(false); setContent(''); }}
              style={{
                background: '#000',
                color: '#ff0055',
                border: '1px solid #ff0055',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '1rem',
                fontWeight: 'bold',
                padding: '8px 20px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              [ ABORT ]
            </button>
            
            <button 
              type="submit"
              style={{
                background: '#00f0ff',
                color: '#000',
                border: 'none',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '1rem',
                fontWeight: 'bold',
                padding: '8px 24px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
              }}
            >
              [ EXECUTE_INJECTION ]
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddTask;
