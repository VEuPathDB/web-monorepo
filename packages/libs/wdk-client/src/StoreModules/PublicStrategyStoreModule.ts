import { Action } from '../Actions';
import {
  setSearchTerm,
  setSort,
  setPrioritizeExamples,
} from '../Actions/PublicStrategyActions';
import { MesaSortObject } from '../Core/CommonTypes';

export const key = 'publicStrategies';

export interface State {
  searchTerm: string;
  sort?: MesaSortObject;
  prioritizeExamples: boolean;
}

const initialState: State = {
  searchTerm: '',
  prioritizeExamples: true,
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case setSearchTerm.type:
      return {
        ...state,
        searchTerm: action.payload.searchTerm,
      };

    case setSort.type:
      return {
        ...state,
        sort: action.payload.sort,
      };

    case setPrioritizeExamples.type:
      return {
        ...state,
        prioritizeExamples: action.payload.prioritizeExamples,
      };

    default:
      return state;
  }
}
