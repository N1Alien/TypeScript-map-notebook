import { Currencies, CurrenciesActions, CurrenciesActionsTypes } from './actions';

export const currenciesReducer = (
  state: Currencies[] = [],
  action: CurrenciesActionsTypes,
): Currencies[] => {
  switch (action.type) {
    case CurrenciesActions.IMPORT_CURRENCIES:
      return action.payload;
    case CurrenciesActions.FETCH_COIN:
      return action.payload;
    default:
      return state;
      break;
  }
};
