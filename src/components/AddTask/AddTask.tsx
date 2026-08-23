import React, { ChangeEvent, useState } from 'react';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { addPost } from '../../redux/actions';
import styles from './AddTask.module.scss';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props {
  className?: string;
}

const AddTask: React.FC<Props> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setContent('');
  };

  const updateNote = (event: ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const onAddNoteClick = () => {
    const id = Math.floor(Math.random() * (1000 - 1)) + 1;
    // POPRAWKA: Rzutowanie na any usuwa błąd asynchronicznej sygnatury Thunk w dispatch
    dispatch(addPost(id, content, "default") as any);
    setContent('');
    setOpen(false);
  };

  return (
    <div className={clsx(className, styles.root)} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
      <button 
        onClick={handleClickOpen}
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

      {/* POPRAWKA: disableEnforceFocus ucisza błąd aria-hidden w silnikach TypeScript */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        disableEnforceFocus
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            backgroundColor: '#050505',
            border: '2px solid #00f0ff',
            borderRadius: '0px',
            boxShadow: '0 0 25px #00f0ff',
            padding: '15px',
            fontFamily: "'Share Tech Mono', monospace"
          }
        }}
      >
        <DialogTitle id="form-dialog-title" disableTypography>
          <h2 style={{ color: '#fcee0a', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.5rem', borderBottom: '1px solid #fcee0a', paddingBottom: '5px' }}>
            // COGNITIVE_INJECTION_INTERFACE
          </h2>
        </DialogTitle>
        
        <DialogContent style={{ marginTop: '10px' }}>
          <DialogContentText style={{ color: '#fff', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            "A journey of a thousand miles begins with a single network handshake."
          </DialogContentText>
          
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', color: '#00f0ff', marginBottom: '5px', textTransform: 'uppercase' }}>
              INPUT_TARGET_IDEA_DATA:
            </label>
            <input
              type="text"
              onChange={updateNote}
              value={content}
              placeholder="Inject string to the mainframe..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#111',
                border: '1px solid #ff0055',
                color: '#fff',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '1.1rem',
                padding: '10px',
                outline: 'none'
              }}
            />
          </div>
        </DialogContent>
        
        <DialogActions style={{ justifyContent: 'space-between', marginTop: '15px', padding: '0 15px' }}>
          <button 
            onClick={handleClose}
            style={{
              background: '#000',
              color: '#ff0055',
              border: '1px solid #ff0055',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '1rem',
              fontWeight: 'bold',
              padding: '6px 18px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            [ ABORT ]
          </button>
          <button 
            onClick={onAddNoteClick}
            style={{
              background: '#00f0ff',
              color: '#000',
              border: 'none',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '1rem',
              fontWeight: 'bold',
              padding: '6px 22px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            [ EXECUTE_INJECTION ]
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddTask;
