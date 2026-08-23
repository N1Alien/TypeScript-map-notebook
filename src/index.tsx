import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Axios from 'axios';

// WYMUSZENIE BAZY - BLOKUJE BŁĘDY CORS I STRZAŁY DO ONRENDER.COM
Axios.defaults.baseURL = "https://onrender.com";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
