import { Context } from 'wdk-client/Views/Question/Params/Utils';
import { TreeBoxEnumParam } from 'wdk-client/Utils/WdkModel';

type Ctx = Context<TreeBoxEnumParam>;

export type Action =
  | SetExpandedListAction
  | SetSearchTermAction

//==============================================================================

export const SET_EXPANDED_LIST = 'enum-param-treebox/set-expanded-list';

export interface SetExpandedListAction {
  type: typeof SET_EXPANDED_LIST;
  payload: Ctx & {
    expandedList: string[];
  };
}

export function setExpandedList(payload: SetExpandedListAction['payload']): SetExpandedListAction {
  return {
    type: SET_EXPANDED_LIST,
    payload
  };
}

//==============================================================================

export const SET_SEARCH_TERM = 'enum-param-treebox/set-search-term';

export interface SetSearchTermAction {
  type: typeof SET_SEARCH_TERM;
  payload: Ctx & {
    searchTerm: string;
  };
}

export function setSearchTerm(payload: SetSearchTermAction['payload']): SetSearchTermAction {
  return {
    type: SET_SEARCH_TERM,
    payload
  };
}

//==============================================================================
