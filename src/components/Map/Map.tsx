import * as React from 'react';
import clsx from 'clsx';
import styles from './Map.module.scss';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Axios from 'axios';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// NOWOCZESNY I PIĘKNY MARKER WEKTOROWY SVG (Z POPRAWIONYMI WARTOŚCIAMI LICZBOWYMI)
const pieknePancerneIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c" width="32px" height="32px">
           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
         </svg>`,
  className: styles.customSvgMarker || 'custom-marker',
  iconSize: [32, 32], // Szerokość i wysokość markera w pikselach
  iconAnchor: [16, 32] // Punkt zakotwiczenia dolnego dzióbka pinezki na współrzędnych mapy
});

interface Props {
  className?: string;
  getIntel: (lat: number, lng: number) => void;
}

interface Params {
  id: string;
}

const Component: React.FC<Props> = ({ className, getIntel }) => {
  const params = useParams<Params>();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const safeId = parseInt(params.id || '0', 10);
  const [savedPostData, setSavedPostData] = useState<any>(null);

  // Pobieramy dane bezpośrednio z json-server dla tego konkretnego ID
  useEffect(() => {
    Axios.get(`http://localhost:4000/posts/${safeId}`)
      .then((res) => {
        if (res.data) {
          setSavedPostData(res.data);
        }
      })
      .catch((err) => console.log(err));
  }, [safeId]);

  // Rysowanie i centrowanie markera przy użyciu pięknej ikony SVG
  useEffect(() => {
    if (savedPostData && savedPostData.coord && savedPostData.coord.lat && mapInstanceRef.current) {
      const lat = savedPostData.coord.lat;
      const lng = savedPostData.coord.lng;

      mapInstanceRef.current.setView([lat, lng], 5);
      
      if (markerInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerInstanceRef.current);
      }
      // Wstrzykujemy naszą bezpieczną wektorową ikonę
      markerInstanceRef.current = L.marker([lat, lng], { icon: pieknePancerneIcon }).addTo(mapInstanceRef.current);
    }
  }, [savedPostData]);

  useLayoutEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Startowy widok mapy
    const map = L.map(mapRef.current).setView([52.2297, 21.0122], 4);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [safeId]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const point = map.mouseEventToLatLng(e.nativeEvent);
    
    const safeLat = Math.max(-90, Math.min(90, point.lat));
    let safeLng = point.lng % 360;
    if (safeLng > 180) safeLng -= 360;
    if (safeLng < -180) safeLng += 360;

    console.log(`🎯 [PANCERNY KLIK] Rejestruję punkt dla zadania ID ${safeId}: lat: ${safeLat}, lng: ${safeLng}`);

    if (markerInstanceRef.current) {
      map.removeLayer(markerInstanceRef.current);
    }

    // Dodanie pięknego, wektorowego markera po kliknięciu
    markerInstanceRef.current = L.marker([safeLat, safeLng], { icon: pieknePancerneIcon }).addTo(map);
    getIntel(safeLat, safeLng);
  };

  return (
    <div id="map" className={clsx(className, styles.root)}>
      <div 
        className="map" 
        ref={mapRef} 
        onClick={handleMapClick}
        style={{ height: '500px', width: '100%', background: '#eaeaea', cursor: 'crosshair' }}
      ></div>
    </div>
  );
};

export { Component as Map };
