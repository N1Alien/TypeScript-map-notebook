import * as React from 'react';
import clsx from 'clsx';
import styles from './DetailsView.module.scss';
import Card from '@material-ui/core/Card';
import { useSelector, useDispatch } from 'react-redux';
import { Task, resetIntelAction, addCoord, importedIntelAction, RootState } from '../../redux/actions'; 
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
  const params = useParams<Params>();
  const dispatch = useDispatch();
  const safePostId = parseInt(params.id, 10);

  const EXACT_CLOUD_URL = (import.meta as any).env?.VITE_API_URL || '';

  // POPRAWKA: Typujemy stan jako RootState, usuwając czerwone podkreślenie filter/length
  const currentPost = useSelector((state: RootState) => {
    const postsList = state.posts || [];
    const found = postsList.filter((post: Task) => String(post.id) === String(params.id));
    return found.length > 0 ? found : null;
  });

  const [distance, setDistance] = useState('');
  const [hasClicked, setHasClicked] = useState(false);
  const [taskContent, setTaskContent] = useState('');

  const resolvedTaskName =
    (taskContent && taskContent.trim()) ||
    (Array.isArray(currentPost) && currentPost[0] && currentPost[0].content && currentPost[0].content.trim()) ||
    `Task ${safePostId}`;

  const obliczDystansMiedzyPunktami = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; 
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

          let distanceText = '0';
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const userLat = position.coords.latitude;
              const userLon = position.coords.longitude;
              const obliczonyDystans = Math.floor(obliczDystansMiedzyPunktami(userLat, userLon, safeLat, safeLng));
              distanceText = String(obliczonyDystans);

              setDistance(distanceText);
              setHasClicked(true);
              dispatch(importedIntelAction(dynamicIntelData));
              dispatch(addCoord(safePostId, resolvedTaskName, { lat: safeLat, lng: safeLng }, distanceText, dynamicIntelData) as any);
            }, () => {
              setDistance(distanceText);
              setHasClicked(true);
              dispatch(importedIntelAction(dynamicIntelData));
              dispatch(addCoord(safePostId, resolvedTaskName, { lat: safeLat, lng: safeLng }, distanceText, dynamicIntelData) as any);
            });
          } else {
            setDistance(distanceText);
            setHasClicked(true);
            dispatch(importedIntelAction(dynamicIntelData));
            dispatch(addCoord(safePostId, resolvedTaskName, { lat: safeLat, lng: safeLng }, distanceText, dynamicIntelData) as any);
          }
        }
      })
      .catch((err) => console.error("❌ Błąd pobierania geolokalizacji:", err));
  };

  useEffect(() => {
    window.onbeforeunload = function () { return true; };
    setDistance('');
    setHasClicked(false);

    Axios.get(`${EXACT_CLOUD_URL}/posts/${safePostId}`)
      .then((res) => {
        if (res.data) {
          setTaskContent(res.data.content || '');

          if (res.data.coord && typeof res.data.coord.lat === 'number') {
            setHasClicked(true);
            if (res.data.distance) {
              setDistance(String(res.data.distance));
            }
            if (res.data.savedIntel) {
              dispatch(importedIntelAction(res.data.savedIntel));
            }
          } else if (res.data.savedIntel) {
            dispatch(importedIntelAction(res.data.savedIntel));
          }
        }
      })
      .catch((err) => console.log("Nowy węzeł taktyczny Neon SQL:", err));
  }, [safePostId, dispatch]);

  return (
    <Card 
      className={clsx(className, styles.root)} 
      style={{ 
        background: '#000000', 
        border: '2px solid #00f0ff', 
        borderRadius: '0px', 
        padding: '15px',
        boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
      }}
    >
      <div style={{ width: '100%', height: '500px', background: '#000' }}>
        <Map getIntel={getIntel} />
      </div>
      
      <div style={{ padding: '15px 0', display: 'flex', justifyContent: 'center' }}>
        {hasClicked && distance && (
          <div 
            className={styles.dist} 
            style={{ 
              fontWeight: 'bold', 
              fontSize: '1.3rem', 
              color: '#fff', 
              backgroundColor: '#ff0055',
              padding: '10px 25px',
              border: '2px solid #fff',
              boxShadow: '0 0 15px #ff0055',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily: "'Share Tech Mono', monospace"
            }}
          >
            ⚡ RANGE_TO_TARGET_GRID: {distance} KM // ACCESS_GRANTED
          </div>
        )}
      </div>
    </Card>
  );
};

export { Component as DetailsView };
