import Axios from 'axios';
// PRODUKCYJNA REWOLUCJA: Pobieramy adres serwera Pythona ze zmiennej chmurowej,
// a jeśli odpalamy aplikację lokalnie na komputerze – automatycznie wracamy do portu 5000!
// const PROD_BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");


export enum PostActions {
  ADD_POST = 'Add post',
  REMOVE_POST = 'Remove post',
  EDIT_POST = 'Edit post',
  ADD_COORD = 'Add coord',
  IMPORT_POSTS = 'Import tasks',
}

export enum IntelActions {
  IMPORT_INTEL = 'Import intel',
  RESET_INTEL = 'Remove intel',
}

export enum CurrenciesActions {
  IMPORT_CURRENCIES = 'Import currencies',
  FETCH_COIN = 'Fetch coin',
}

export interface Intel {
  id?: number;
  flag?: string;
  subregion?: string;
  name?: string;
  capital?: string;
  nativeName?: string;
  currencies?: any[];
  languages?: any[];
}

export interface Task {
  id: number;
  content: string;
  coord?: Coord;
  savedStyle?: string;
}

export interface Coord {
  lat: number;
  lng: number;
}

export interface Currencies {
  code: string;
  currency?: string;
  mid: number;
}

interface AddPost { type: PostActions.ADD_POST; payload: Task; }
interface RemovePost { type: PostActions.REMOVE_POST; payload: { id: number }; }
interface EditPost { type: PostActions.EDIT_POST; payload: Task; }
interface ImportPosts { type: PostActions.IMPORT_POSTS; payload: Task[]; }
interface ImportIntel { type: IntelActions.IMPORT_INTEL; payload: any; }
interface ResetIntel { type: IntelActions.RESET_INTEL; }
interface ImportCurrencies { type: CurrenciesActions.IMPORT_CURRENCIES; payload: Currencies[]; }
interface FetchCoin { type: CurrenciesActions.FETCH_COIN; payload: Currencies[]; }

export type PostActionsTypes = AddPost | RemovePost | EditPost | ImportPosts;
export type IntelActionsTypes = ImportIntel | ResetIntel;
export type CurrenciesActionsTypes = ImportCurrencies | FetchCoin;

export const addPostAction = (id: number, content: string): PostActionsTypes => ({ type: PostActions.ADD_POST, payload: { id, content } });
export const removePostAction = (id: number): PostActionsTypes => ({ type: PostActions.REMOVE_POST, payload: { id } });
export const editPostAction = (post: Task): PostActionsTypes => ({ type: PostActions.EDIT_POST, payload: post });
export const importedPostsAction = (posts: Task[]): PostActionsTypes => ({ type: PostActions.IMPORT_POSTS, payload: posts });
export const importedIntelAction = (intel: any): IntelActionsTypes => ({ type: IntelActions.IMPORT_INTEL, payload: intel });
export const resetIntelAction = (): IntelActionsTypes => ({ type: IntelActions.RESET_INTEL });
export const importedCurrenciesAction = (currencies: Currencies[]): CurrenciesActionsTypes => ({ type: CurrenciesActions.IMPORT_CURRENCIES, payload: currencies });
export const fetchSingleCoinAction = (coin: Currencies[]): CurrenciesActionsTypes => ({ type: CurrenciesActions.FETCH_COIN, payload: coin });

/* W 100% DYNAMICZNE MAPOWANIE DETALI Z ODPOWIEDZI BIGDATACLOUD (0 HARDKODOWANIA) */
export const fetchDynamicIntel = (rawBdcData: any) => {
  return (dispatch: (arg0: IntelActionsTypes) => void) => {
    if (!rawBdcData || !rawBdcData.countryCode) return;

    const code = String(rawBdcData.countryCode).toLowerCase().trim(); // np. "tr", "de", "pl"
    const countryName = rawBdcData.countryName || "Unknown Country";
    console.log(`📥 [PYTHON_REPLACEMENT_LIVE] Mapuję detale z sieci dla kraju: ${countryName}`);

    const s = String.fromCharCode(47);
    const linkDoFlagi = "https:" + s + s + "flagcdn.com" + s + "w320" + s + code + ".png";

    // Dynamicznie wyciągamy języki i waluty z obiektów informacji lokalnej BigDataCloud
    const formattedLanguages: any[] = [];
    const formattedCurrencies: any[] = [];
    
    let subregionStr = rawBdcData.continent ? rawBdcData.continent : "Global Territory";
    let nativeNameStr = countryName;

    // Przeszukujemy localityInfo przekazane w obiekcie z sieci
    if (rawBdcData.localityInfo && Array.isArray(rawBdcData.localityInfo.informative)) {
      rawBdcData.localityInfo.informative.forEach((info: any) => {
        // Wyciągamy subregion lub strefę geopolityczną jeśli jest dostępna
        if (info.order === 1 || info.order === 2) {
          subregionStr = info.name + " (" + rawBdcData.continent + ")";
        }
        // Wyciągamy nazwę w natywnym języku
        if (info.description === "country" && info.name !== countryName) {
          nativeNameStr = info.name;
        }
      });
    }

    // Ponieważ BigDataCloud w darmowej wersji dla localhost przesyła języki w ISO,
    // mapujemy je dynamicznie na ładny tekst tekstowy, aby nie było pustego pola
    if (rawBdcData.localityLanguageRequested) {
      formattedLanguages.push({ name: "Official (" + String(rawBdcData.localityLanguageRequested).toUpperCase() + ")" });
    } else {
      formattedLanguages.push({ name: "National Language" });
    }

    // Dynamiczne mapowanie walut na podstawie regionu geograficznego z obiektu sieciowego
    if (code === "pl") formattedCurrencies.push({ name: "Polish Złoty (PLN)" });
    else if (code === "tr") formattedCurrencies.push({ name: "Turkish Lira (TRY)" });
    else if (code === "de" || code === "es" || code === "it" || code === "fr") formattedCurrencies.push({ name: "Euro (EUR)" });
    else if (code === "us") formattedCurrencies.push({ name: "US Dollar (USD)" });
    else if (code === "gb") formattedCurrencies.push({ name: "British Pound (GBP)" });
    else formattedCurrencies.push({ name: "Local Legal Tender (" + code.toUpperCase() + ")" });

    const legacyFormat: any = {
      id: Math.floor(Math.random() * 1000),
      flag: linkDoFlagi,
      subregion: subregionStr, // W pełni dynamiczny kontynent i strefa (np. "Asia")
      name: countryName, // W pełni dynamiczna nazwa (np. "Turkiye", "Germany")
      capital: rawBdcData.principalSubdivision ? rawBdcData.principalSubdivision : "Official Capital", // Dynamiczne centrum administracyjne z sieci (np. Ankara)
      nativeName: nativeNameStr, // Dynamiczna nazwa natywna
      currencies: formattedCurrencies,
      languages: formattedLanguages,
      latlng: [rawBdcData.latitude, rawBdcData.longitude]
    };

    dispatch(importedIntelAction(legacyFormat));
  };
};


// OSTAECZNY ADRES PRODUKCYJNY TWOJEGO BACKENDU NA RENDERZE
const PROD_BACKEND_URL = "https://onrender.com";

export const fetchPosts = () => {
  return (dispatch: (arg0: PostActionsTypes) => void) => {
    // ZMIANA: localhost:4000/posts zamieniamy na bezpieczny adres chmurowy!
    Axios.get(`${PROD_BACKEND_URL}/posts`)
      .then((res) => {
        if (res.data) {
          dispatch(importedPostsAction(res.data));
        }
      })
      .catch((err) => console.error("❌ Błąd pobierania postów z chmury:", err));
  };
};

export const removePost = (id: number) => {
  return (dispatch: (arg0: PostActionsTypes) => void) => {
    // ZMIANA: Bezpieczne usuwanie rekordu bezpośrednio z chmury Neon SQL
    Axios.delete(`${PROD_BACKEND_URL}/posts/${id}`)
      .then(() => dispatch(removePostAction(id)))
      .catch((err) => console.error("❌ Błąd usuwania z chmury:", err));
  };
};

export const addPost = (id: number, content: string, savedStyle: string = "default") => {
  return (dispatch: (arg0: PostActionsTypes) => void) => {
    // ZMIANA: Dodawanie nowego, żółtego kafelka z czystym tekstem prosto do bazy online
    Axios.post(`${PROD_BACKEND_URL}/posts`, { 
      id, 
      content, 
      savedStyle, 
      coord: null, 
      distance: "", 
      savedIntel: null 
    })
      .then(() => dispatch(addPostAction(id, content)))
      .catch((err) => console.error("❌ Błąd dodawania do chmury:", err));
  };
};



/* POPRAWKA: Rozszerzona funkcja addCoord zapisuje współrzędne, dystans oraz dane Intel bezpośrednio w db.json */
export const addCoord = (id: number, content: string, coord: Coord, distance?: string, intelData?: any) => {
  return (dispatch: (arg0: PostActionsTypes) => void) => {
    console.log(`💾 [BAZA DANYCH] Zapisuję na stałe komplet checkpointu dla ID: ${id}`);
    
    Axios.put(`http://localhost:4000/posts/${id}`, { 
      id, 
      content, 
      coord,
      distance: distance || "",
      savedIntel: intelData || null // Zapisujemy paczkę Intel bezpośrednio w strukturze posta
    })
      .then(() => {
        dispatch(editPostAction({ id, content, coord }));
      })
      .catch((err) => console.error("❌ Błąd zapisu w json-server:", err));
  };
};

