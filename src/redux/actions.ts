import Axios from 'axios';

// STRUKTURA DANYCH DLA TYPESCRIPT
export interface Task {
  id: number;
  content: string;
  savedStyle: string;
  coord?: { lat: number; lng: number } | null;
  distance?: string;
  savedIntel?: any;
}

export interface Currencies {
  code: string;
  currency: string;
  mid: number;
}

export interface RootState {
  posts: Task[];
  intel: any;
  currencies?: Currencies[];
}

export const IMPORTED_POSTS = 'IMPORTED_POSTS';
export const REMOVE_POST = 'REMOVE_POST';
export const ADD_POST = 'ADD_POST';
export const EDIT_POST = 'EDIT_POST';
export const IMPORTED_INTEL = 'IMPORTED_INTEL';
export const RESET_INTEL = 'RESET_INTEL';

interface ImportedPostsAction {
  type: typeof IMPORTED_POSTS;
  payload: Task[];
}

interface RemovePostAction {
  type: typeof REMOVE_POST;
  payload: number;
}

interface AddPostAction {
  type: typeof ADD_POST;
  id: number;
  content: string;
}

interface EditPostAction {
  type: typeof EDIT_POST;
  payload: Task;
}

interface ImportedIntelAction {
  type: typeof IMPORTED_INTEL;
  payload: any;
}

interface ResetIntelAction {
  type: typeof RESET_INTEL;
}

export type PostActionsTypes = 
  | ImportedPostsAction 
  | RemovePostAction 
  | AddPostAction 
  | EditPostAction 
  | ImportedIntelAction 
  | ResetIntelAction;

// ============================================================================
// PROFESJONALNA INSTANCJA CYBER_API - BLOKADA BŁĘDÓW 301 ORAZ CORS
// ============================================================================
const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || '';

const cyberApi = Axios.create({
  baseURL: apiBaseUrl || undefined,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const importedPostsAction = (posts: Task[]): PostActionsTypes => ({
  type: IMPORTED_POSTS,
  payload: posts,
});

export const removePostAction = (id: number): PostActionsTypes => ({
  type: REMOVE_POST,
  payload: id,
});

export const addPostAction = (id: number, content: string, savedStyle: string = 'default'): PostActionsTypes => ({
  type: ADD_POST,
  payload: { id, content, savedStyle },
});

export const editPostAction = (post: Task): PostActionsTypes => ({
  type: EDIT_POST,
  payload: post,
});

export const importedIntelAction = (intel: any): PostActionsTypes => ({
  type: IMPORTED_INTEL,
  payload: intel,
});

export const resetIntelAction = (): PostActionsTypes => ({
  type: RESET_INTEL,
});

// Znajdź i podmień funkcję fetchPosts na tę wersję:
export const fetchPosts = () => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    // Uderzamy bezpośrednio przez sprawdzoną instancję cyberApi
    cyberApi.get('/posts')
      .then((res) => {
        if (res.data) {
          // POPRAWKA KLUCZ: Jeśli dane z chmury przychodzą jako czysta tablica [],
          // upewniamy się, że przesyłamy ją bezpośrednio do reduktora jako poprawny payload.
          // Dodatkowo zabezpieczamy strukturę na wypadek, gdyby obiekt był zagnieżdżony.
          const postsArray = Array.isArray(res.data) ? res.data : (res.data.payload || []);
          
          console.log("🍏 [RED_DECK] Pomyślnie wstrzykuję tablicę do stanu Redux:", postsArray);
          dispatch(importedPostsAction(postsArray as Task[]));
        }
      })
      .catch((err) => console.error("❌ Błąd pobierania postów z chmury Neon:", err));
  };
};


export const removePost = (id: number) => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    cyberApi.delete(`/posts/${id}`)
      .then(() => dispatch(removePostAction(id)))
      .catch((err) => console.error("❌ Błąd usuwania z chmury:", err));
  };
};

export const addPost = (id: number, content: string, savedStyle: string = "default") => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    // Przesyłamy kompletny cyberpunkowy payload, akceptowany przez nowy server.py!
    cyberApi.post('/posts', { 
      content, 
      savedStyle 
    })
      .then(() => {
        console.log("📥 [NEON SQL] Wstrzyknięto nowy węzeł do chmury! Odświeżam matrycę...");
        dispatch(fetchPosts() as any);
      })
      .catch((err) => console.error("❌ Błąd dodawania do chmury:", err));
  };
};

export const addCoord = (id: number, content: string, coord: { lat: number; lng: number }, distance: string, savedIntel: any) => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    const updatedTask: Task = { id, content, savedStyle: "default", coord, distance, savedIntel };
    cyberApi.put(`/posts/${id}`, updatedTask)
      .then(() => dispatch(editPostAction(updatedTask)))
      .catch((err) => console.error("❌ Błąd aktualizacji współrzędnych w chmurze:", err));
  };
};

// Fizyczne literały zapobiegające błędom MISSING_EXPORT podczas kompilacji Vite
export const PostActions = {
  ADD_POST,
  REMOVE_POST,
  EDIT_POST,
  IMPORT_POSTS: IMPORTED_POSTS,
};

export const IntelActions = {
  IMPORT_INTEL: IMPORTED_INTEL,
  RESET_INTEL,
};

export const CurrenciesActions = {};
