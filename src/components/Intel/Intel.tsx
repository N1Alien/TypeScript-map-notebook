import * as React from 'react';
import clsx from 'clsx';
import styles from './Intel.module.scss';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import { Paper } from '@material-ui/core';
import { Button } from '../../components-atoms/Button/Button';

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const intel = useSelector((state: any) => state['intel']);

  let countryData: any = null;
  if (intel) {
    if (Array.isArray(intel)) {
      countryData = Array.isArray(intel) ? intel : intel;
    } else {
      countryData = intel;
    }
  }

  if (!countryData || !countryData.name || countryData.name === 'Unknown') {
    return null;
  }

  return (
    <Card className={clsx(className, styles.root)} style={{ boxShadow: 'none', border: 'none', marginTop: '20px' }}>
      <CardActionArea className={styles.cont}>
        <Paper variant="outlined" style={{ display: 'inline-block', padding: '10px' }}>
          <img src={countryData.flag} alt="flag" style={{ maxWidth: '150px', height: 'auto' }} />
        </Paper>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">Subregion: {countryData.subregion}</Typography>
          <Typography gutterBottom variant="h5" component="h2">Country: {countryData.name}</Typography>
          <Typography gutterBottom variant="h5" component="h2">
            Currency: {countryData.currencies && countryData.currencies ? countryData.currencies.name : 'N/A'}
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">Capital: {countryData.capital}</Typography>
          <Typography gutterBottom variant="h5" component="h2">
            Language: {countryData.languages && countryData.languages ? countryData.languages.name : 'N/A'}
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">Native Name: {countryData.nativeName}</Typography>
        </CardContent>
      </CardActionArea>
      
      {/* POPRAWKA: Dodano justify-content: center do kontenera przycisku */}
      <CardActions style={{ justifyContent: 'center', paddingBottom: '15px' }}>
        <Button
          text="wikipedia"
          onClick={() => {
            const s = String.fromCharCode(47);
            const countryCleanName = String(countryData.name).trim();
            const formattedName = countryCleanName.charAt(0).toUpperCase() + countryCleanName.slice(1);
            const ostatecznyUrlWiki = "https:" + s + s + "en.wikipedia.org" + s + "wiki" + s + formattedName;
            
            window.open(ostatecznyUrlWiki, '_blank');
          }}
        />
      </CardActions>
    </Card>
  );
};

export { Component as Intel };
