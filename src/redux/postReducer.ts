import { Task, PostActions, PostActionsTypes } from './actions';

export const postReducer = (state: Task[] = [] , action: PostActionsTypes): Task[] => {
  switch (action.type) {
    case PostActions.ADD_POST:
      return [...state, action.payload];
    case PostActions.EDIT_POST:
      return state.map((post) => (post.id === action.payload.id ? action.payload : post));
    case PostActions.REMOVE_POST:
      return state.filter((post) => post.id !== action.payload.id);
    case PostActions.IMPORT_POSTS:
      return action.payload;
    default:
      return state;
      break;
  }
};
