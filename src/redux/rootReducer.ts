import { combineReducers } from "redux";
import { postReducer } from "./postReducer";
import { intelReducer } from './intelReducer';
import { currenciesReducer } from './currenciesReducer';

export const rootReducer = combineReducers({
    posts: postReducer,
    intel: intelReducer,
    currencies: currenciesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
