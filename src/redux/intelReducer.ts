import { Intel, IntelActions, IntelActionsTypes } from './actions';

export const intelReducer = (state: Intel[] = [], action: IntelActionsTypes): Intel[] => {
    switch (action.type) {
      case IntelActions.IMPORT_INTEL:
        return action.payload;
      case IntelActions.RESET_INTEL:
        return state = [];
      default:
        return state;
        break;
    }
};
