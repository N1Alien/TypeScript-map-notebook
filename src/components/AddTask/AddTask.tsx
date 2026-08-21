import React, { ChangeEvent } from 'react';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { addPost } from '../../redux/actions';
import styles from './AddTask.module.scss';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button } from '../../components-atoms/Button/Button';
import { Input } from '../../components-atoms/Input/Input';

interface Props {
  className?: string;
}

interface NewNoteInputProps {
  addNote(note: string): void;
}

const AddTask: React.FC<Props> = ({ className }) => {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
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
    
    // POPRAWKA VITE: Inicjalizujemy bazowe pole savedStyle jako puste ciągi, 
    // aby baza danych json-server od pierwszej sekundy była gotowa na zmianę motywów CSS!
    dispatch(addPost(id, content, "default") as any);
    
    setContent('');
    setOpen(false);
  };


  return (
    <div className={clsx(className, styles.root)}>
      <Button text="AddTask" mode="nav" onClick={handleClickOpen} />
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Where to ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A journey of a thousand miles begins with a single step
          </DialogContentText>
          <Input
            onChange={updateNote}
            value={content}
            label="Enter your idea"
            placeholder="Enter your idea"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} text="Cancel" />
          <Button onClick={onAddNoteClick} text="Add" />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddTask;
