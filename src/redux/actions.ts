import Axios from 'axios';

// PRECYZYJNA DEFINICJA STRUKTURY DANYCH DLA TYPESCRIPT
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

// DEFINICJA GLOBALNEGO STANU REDUX
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

// PANCERNY LINK DO TWOJEGO BACKENDU - BEZ UKOŚNIKA NA KOŃCU!
const EXACT_CLOUD_URL = "https://onrender.com";

export const importedPostsAction = (posts: Task[]): PostActionsTypes => ({
  type: IMPORTED_POSTS,
  payload: posts,
});

export const removePostAction = (id: number): PostActionsTypes => ({
  type: REMOVE_POST,
  payload: id,
});

export const addPostAction = (id: number, content: string): PostActionsTypes => ({
  type: ADD_POST,
  id,
  content,
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

// W pliku actions.ts zmień funkcje sieciowe na czyste podkatalogi:

export const fetchPosts = () => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    // Czyste /posts zamiast pełnego adresu URL
    Axios.get('/posts')
      .then((res) => {
        if (res.data) {
          dispatch(importedPostsAction(res.data as Task[]));
        }
      })
      .catch((err) => console.error("❌ Błąd:", err));
  };
};

export const removePost = (id: number) => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    Axios.delete(`/posts/${id}`)
      .then(() => dispatch(removePostAction(id)))
      .catch((err) => console.error(err));
  };
};

export const addPost = (id: number, content: string, savedStyle: string = "default") => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    // Wysyłamy czysty payload do server.py na porcie 5000 (chmura Render)
    Axios.post('https://onrender.com', { 
      content, 
      savedStyle 
    })
      .then(() => {
        console.log("📥 [NEON SQL] Wstrzyknięto rekord pomyślnie! Pobieram nową matrycę...");
        // Twarde wymuszenie zaciągnięcia świeżych danych z bazy online
        Axios.get('https://onrender.com')
          .then((res) => {
            if (res.data) {
              dispatch(importedPostsAction(res.data as Task[]));
            }
          });
      })
      .catch((err) => console.error("❌ Błąd dodawania do chmury:", err));
  };
};

export const addCoord = (id: number, content: string, coord: { lat: number; lng: number }, distance: string, savedIntel: any) => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    const updatedTask: Task = { id, content, savedStyle: "default", coord, distance, savedIntel };
    Axios.put(`/posts/${id}`, updatedTask)
      .then(() => dispatch(editPostAction(updatedTask)))
      .catch((err) => console.error(err));
  };
};


// Puste placeholdery, które trwale gaszą błędy [MISSING_EXPORT] w Vite/Rolldown
export const PostActions = {};
export const IntelActions = {};
export const CurrenciesActions = {};
