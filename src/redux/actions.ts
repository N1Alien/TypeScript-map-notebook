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
const cyberApi = Axios.create({
  baseURL: "https://cyber-map-backend.onrender.com",
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

// ASYNCHRONICZNE AKCJE THUNK WYKORZYSTUJĄCE ODREDOWANĄ INSTANCJĘ CYBER_API
export const fetchPosts = () => {
  return (dispatch: (arg: PostActionsTypes) => void) => {
    cyberApi.get('/posts')
      .then((res) => {
        if (res.data) {
          dispatch(importedPostsAction(res.data as Task[]));
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
    cyberApi.post('/posts', { 
      id, 
      content, 
      savedStyle, 
      coord: null, 
      distance: "", 
      savedIntel: null 
    })
      .then(() => {
        // Po udanym wstrzyknięciu natychmiast odświeżamy listę z bazy Neon SQL
        cyberApi.get('/posts')
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
    cyberApi.put(`/posts/${id}`, updatedTask)
      .then(() => dispatch(editPostAction(updatedTask)))
      .catch((err) => console.error("❌ Błąd aktualizacji współrzędnych w chmurze:", err));
  };
};

// Fizyczne literały zapobiegające błędom MISSING_EXPORT podczas kompilacji Vite
export const PostActions = {};
export const IntelActions = {};
export const CurrenciesActions = {};
