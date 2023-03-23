import { union, difference } from 'lodash';
import { Action } from '../Actions';
import {
  setActiveTab,
  addToStrategyListSelection,
  removeFromStrategyListSelection,
  setStrategyListSort,
  setSearchTerm,
} from '../Actions/StrategyListActions';
import { MesaSortObject } from '../Core/CommonTypes';

export const key = 'strategyList';

type State = {
  selectedStrategyIds: number[];
  activeTab?: string;
  searchTermsByTableId: Record<string, string | undefined>;
  selectedStrategiesByTableId: Record<string, number[] | undefined>;
  sortByTableId: Record<string, MesaSortObject>;
};

const initialViewState: State = {
  searchTermsByTableId: {},
  selectedStrategyIds: [],
  selectedStrategiesByTableId: {},
  sortByTableId: {},
};

export function reduce(state: State = initialViewState, action: Action): State {
  switch (action.type) {
    case setActiveTab.type:
      return { ...state, activeTab: action.payload.tabId };
    case setSearchTerm.type:
      return {
        ...state,
        searchTermsByTableId: {
          ...state.searchTermsByTableId,
          [action.payload.tableId]: action.payload.searchTerm,
        },
      };
    case addToStrategyListSelection.type:
      return {
        ...state,
        selectedStrategiesByTableId: {
          ...state.selectedStrategiesByTableId,
          [action.payload.tableId]: union(
            state.selectedStrategiesByTableId[action.payload.tableId],
            action.payload.strategyIds
          ),
        },
      };
    case removeFromStrategyListSelection.type:
      return {
        ...state,
        selectedStrategiesByTableId: {
          ...state.selectedStrategiesByTableId,
          [action.payload.tableId]: difference(
            state.selectedStrategiesByTableId[action.payload.tableId],
            action.payload.strategyIds
          ),
        },
      };
    case setStrategyListSort.type:
      return {
        ...state,
        sortByTableId: {
          ...state.sortByTableId,
          [action.payload.tableId]: action.payload.sort,
        },
      };
    default:
      return state;
  }
}
