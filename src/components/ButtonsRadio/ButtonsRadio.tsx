import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editPostAction, Task, RootState } from '../../redux/actions';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Axios from 'axios';

interface Props {
  id: number;
}

export const ButtonsRadio: React.FC<Props> = ({ id }) => {
  const dispatch = useDispatch();
  const EXACT_CLOUD_URL = "https://onrender.com";

  // POPRAWKA: Jawnopolowa integracja RootState zabezpiecza przed błędem indeksowania tablicy posts
  const currentPost = useSelector((state: RootState) => {
    const postsList = state.posts || [];
    return postsList.find((post: Task) => post.id === id) || null;
  });

  const value = currentPost ? currentPost.savedStyle : 'default';

  // POPRAWKA: Jawne otypowanie zdarzenia zmiany i obsługa przesyłania do Axiosa
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = event.target.value;
    if (currentPost) {
      const updatedPost: Task = { ...currentPost, savedStyle: newStyle };
      
      dispatch(editPostAction(updatedPost));
      Axios.put(`${EXACT_CLOUD_URL}/posts/${id}`, updatedPost)
        .catch((err) => console.error("❌ Błąd zapisu stylu czcionki:", err));
    }
  };

  return (
    <FormControl component="fieldset">
      <RadioGroup row aria-label="font-style" name="font-style" value={value} onChange={handleChange}>
        <FormControlLabel value="default" control={<Radio style={{ color: '#000' }} />} label="N" style={{ color: '#000' }} />
        <FormControlLabel value="bold" control={<Radio style={{ color: '#000' }} />} label="B" style={{ color: '#000' }} />
        <FormControlLabel value="italic" control={<Radio style={{ color: '#000' }} />} label="I" style={{ color: '#000' }} />
        <FormControlLabel value="underline" control={<Radio style={{ color: '#000' }} />} label="U" style={{ color: '#000' }} />
      </RadioGroup>
    </FormControl>
  );
};
