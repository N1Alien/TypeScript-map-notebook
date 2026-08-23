import * as React from 'react';
import clsx from 'clsx';
import styles from './ButtonsRadio.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { editPostAction, Task } from '../../redux/actions';
import { RadioGroup } from '../../components-atoms/RadioGroup/RadioGroup';
import { Radio } from '../../components-atoms/Radio/Radio';
import { useEffect, useState } from 'react';
import Axios from 'axios'; // Zaimportowano Axios do trwałej synchronizacji stylów z db.json

interface Props {
  className?: string;
  id: number;
}

const Component: React.FC<Props> = ({ className, id }) => {
  const [value, setValue] = useState('');
  const dispatch = useDispatch();
  
  const postsList = useSelector((state: any) => state['posts'] || []);
  
  // Bezpieczne filtrowanie wybranego posta z pamięci Redux
  const foundPost = postsList.find((post: Task) => String(post.id) === String(id));

  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  // Synchronizujemy stan zaznaczonych kropek radiowych zawsze, gdy baza danych zaktualizuje pole savedStyle
  useEffect(() => {
    if (foundPost && foundPost.savedStyle) {
      setValue(foundPost.savedStyle);
      setRadioButtons(foundPost.savedStyle);
    }
  }, [foundPost?.savedStyle]);

  const handleChange = (event: any) => {
    const wybranyStyl = event.target.value;
    if (!foundPost) return;

    setValue(wybranyStyl);
    setRadioButtons(wybranyStyl);

    const zaktualizowanyPost = {
      ...foundPost,
      savedStyle: wybranyStyl
    };

    // 1. Natychmiastowa aktualizacja interfejsu wizualnego w React (Redux Store)
    dispatch(editPostAction(zaktualizowanyPost));

    // 2. POPRAWKA KLUCZ: Trwały strzał sieciowy PUT do pliku db.json na porcie 4000.
    // Dzięki temu personalizacja czcionki (B, I, U) jest trwale zapamiętana na zawsze!
        // Zastępujemy lokalne zmienne bezpiecznym adresem produkcyjnym
    const baseApiUrl = "https://onrender.com";
    Axios.put(`${baseApiUrl}/posts/${id}`, zaktualizowanyPost)
      .then(() => console.log(`💾 [STYL ZAPISANY] Status 200 OK w chmurze Neon!`))
      .catch(err => console.error(err));

  };

  const setRadioButtons = (val: string) => {
    setBold(false);
    setItalic(false);
    setUnderline(false);
    if (val === 'bold') {
      setBold(true);
    } else if (val === 'italic') {
      setItalic(true);
    } else if (val === 'underline') {
      setUnderline(true);
    }
  };

  return (
    <div className={clsx(className, styles.root)}>
      <RadioGroup onChange={(event) => handleChange(event)}>
        <Radio text="B" value="bold" checked={bold} onChange={()=>{}}/>
        <Radio text="I" value="italic" checked={italic} onChange={()=>{}}/>
        <Radio text="U" value="underline" checked={underline} onChange={()=>{}}/>
      </RadioGroup>
    </div>
  );
};

export { Component as ButtonsRadio };
