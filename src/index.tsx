import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Axios from 'axios';

// GLOBALNY WYMAZYWACZ LOCALHOSTA I ŚLEPYCH ADRESÓW
// Ta linijka nadpisuje absolutnie każdy strzał Axios na starcie aplikacji!
Axios.defaults.baseURL = "https://cyber-map-backend.onrender.com";

console.log("⚡ [PROTKOŁ_SIEĆ] Globalny adres bazy ustawiony na: https://cyber-map-backend.onrender.com");

ReactDOM.render(
    <App />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
