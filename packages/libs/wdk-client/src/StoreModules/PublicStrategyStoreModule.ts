import { Action } from 'wdk-client/Actions';
import { setSearchTerm, setSort, setPrioritizeEuPathDbExamples } from 'wdk-client/Actions/PublicStrategyActions';
import { MesaSortObject } from 'wdk-client/Core/CommonTypes';

export const key = 'publicStrategies';

export interface State {
  searchTerm: string,
  sort?: MesaSortObject,
  prioritizeEuPathDBExamples: boolean
}

const initialState: State = {
  searchTerm: '',
  prioritizeEuPathDBExamples: true
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case setSearchTerm.type:
      return { 
        ...state, 
        searchTerm: action.payload.searchTerm 
      };

    case setSort.type:
      return { 
        ...state, 
        sort: action.payload.sort 
      };

    case setPrioritizeEuPathDbExamples.type:
      return { 
        ...state, 
        prioritizeEuPathDBExamples: action.payload.prioritizeEuPathDBExamples 
      };

    default:
      return state;
  }
}
