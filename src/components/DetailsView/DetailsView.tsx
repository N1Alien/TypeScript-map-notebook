import * as React from 'react';
import clsx from 'clsx';
import styles from './DetailsView.module.scss';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { useDispatch } from 'react-redux';
import { fetchDynamicIntel, resetIntelAction, addCoord, importedIntelAction } from '../../redux/actions'; 
import { useParams } from 'react-router-dom';
import { Map } from '../Map/Map';
import { useState, useEffect } from 'react';
import Axios from 'axios';

interface Props {
  className?: string;
}

interface Params {
  id: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const params: Params = useParams();
  const dispatch = useDispatch();
  const safePostId = parseInt(params.id, 10);

  const [distance, setDistance] = useState('');
  const [hasClicked, setHasClicked] = useState(false);
  const [taskContent, setTaskContent] = useState('');

  const obliczDystansMiedzyPunktami = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Promień Ziemi w km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getIntel = (clickedLat: number, clickedLng: number) => {
    const s = String.fromCharCode(47);
    const safeLat = Math.max(-90, Math.min(90, clickedLat));
    let safeLng = clickedLng % 360;
    if (safeLng > 180) safeLng -= 360;
    if (safeLng < -180) safeLng += 360;

    const bdcUrl = "https:" + s + s + "api.bigdatacloud.net" + s + "data" + s + "reverse-geocode-client?latitude=" + safeLat + "&longitude=" + safeLng + "&localityLanguage=en";

    console.log(`📡 [CHMURA] Odpytuję o punkt: lat: ${safeLat}, lng: ${safeLng}`);

    Axios.get<any>(bdcUrl)
      .then((res) => {
        if (res.data && res.data.countryCode) {
          const code = String(res.data.countryCode).toLowerCase().trim();
          const countryName = res.data.countryName || "Unknown Country";
          const linkDoFlagi = "https:" + s + s + "flagcdn.com" + s + "w320" + s + code + ".png";
          
          let subregionStr = res.data.continent || "Global Territory";
          if (res.data.localityInfo && Array.isArray(res.data.localityInfo.informative)) {
            const inf = res.data.localityInfo.informative.find((i: any) => i.order === 1 || i.order === 2);
            if (inf) subregionStr = inf.name + " (" + res.data.continent + ")";
          }

          const currencyName = code === "pl" ? "Polish Złoty (PLN)" : code === "tr" ? "Turkish Lira (TRY)" : "Local Currency";

          const dynamicIntelData = {
            id: Math.floor(Math.random() * 1000),
            flag: linkDoFlagi,
            subregion: subregionStr,
            name: countryName,
            capital: res.data.principalSubdivision || "Main Center",
            nativeName: countryName,
            currencies: [{ name: currencyName }],
            languages: [{ name: "Official Language" }],
            latlng: [safeLat, safeLng]
          };

          // WYMIAR LICZENIA ODLEGŁOŚCI OD TWÓJEGO GPS
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const userLat = position.coords.latitude;
              const userLon = position.coords.longitude;
              
              const obliczonyDystans = Math.floor(obliczDystansMiedzyPunktami(userLat, userLon, safeLat, safeLng));
              const stringDystans = String(obliczonyDystans);

              // Blokujemy stany lokalne natychmiastowo na stałe
              setDistance(stringDystans);
              setHasClicked(true);
              dispatch(importedIntelAction(dynamicIntelData));

              // Bezpieczny i trwały zapis PUT
              const contentText = taskContent || "Task " + safePostId;
              dispatch(addCoord(safePostId, contentText, { lat: safeLat, lng: safeLng }, stringDystans, dynamicIntelData) as any);
            });
          }
        }
      })
      .catch((err) => console.error("❌ Błąd pobierania geolokalizacji:", err));
  };

  // POPRAWKA KLUCZ: Ładujemy dane bezwzględnie i bezpośrednio z bazy danych json-server na starcie!
  useEffect(() => {
    window.onbeforeunload = function () { return true; };
    
    // Reset widoku na wejściu do nowej karty
    setDistance('');
    setHasClicked(false);
    dispatch(resetIntelAction());

    console.log(`📡 [TWARDY REFRESH] Pobieram stan archiwalny dla ID: ${safePostId}`);
    
    Axios.get(`http://localhost:4000/posts/${safePostId}`)
      .then((res) => {
        if (res.data) {
          setTaskContent(res.data.content || '');
          
          // Jeśli w db.json są już zapisane współrzędne oraz odległość - wstrzykujemy je bezpośrednio!
          if (res.data.coord && res.data.coord.lat) {
            setHasClicked(true);
            if (res.data.distance) {
              setDistance(String(res.data.distance));
            }
            if (res.data.savedIntel) {
              dispatch(importedIntelAction(res.data.savedIntel));
            }
          }
        }
      })
      .catch((err) => console.log("Nowe zadanie, brak wpisu w db.json:", err));
  }, [safePostId]);

  return (
    <Card className={clsx(className, styles.root)}>
      <CardContent>
        <Map getIntel={getIntel} />
      </CardContent>
      <div style={{ padding: '10px 0', textAlign: 'center' }}>
        {hasClicked && distance && (
          <div className={styles.dist} style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' }}>
            📍 Distance to selected checkpoint: {distance} km
          </div>
        )}
      </div>
    </Card>
  );
};

export { Component as DetailsView };
