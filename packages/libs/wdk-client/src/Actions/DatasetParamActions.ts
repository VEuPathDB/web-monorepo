import { Context } from 'wdk-client/Views/Question/Params/Utils';
import { DatasetParam } from 'wdk-client/Utils/WdkModel';
import { StrategySummary } from "wdk-client/Utils/WdkUser";

type Payload<T> = Context<DatasetParam> & T;

export type Action =
  | SetBasketCountAction
  | SetFileAction
  | SetFileParserAction
  | SetIdListAction
  | SetLoadingIdListAction
  | SetSourceTypeAction
  | SetStrategyIdAction
  | SetStrategyListAction
  | SetUrlAction
  | SetUrlParserAction

//==============================================================================

export const SET_SOURCE_TYPE = 'dataset-param/set-source-type';

export interface SetSourceTypeAction {
  type: typeof SET_SOURCE_TYPE;
  payload: Payload<{
    sourceType:
      | 'idList'
      | 'file'
      | 'basket'
      | 'strategy'
      | 'url';
  }>;
}

export function setSourceType(payload: SetSourceTypeAction['payload']): SetSourceTypeAction {
  return {
    type: SET_SOURCE_TYPE,
    payload
  }
}

//==============================================================================

export const SET_ID_LIST = 'dataset-param/set-id-list';

export interface SetIdListAction {
  type: typeof SET_ID_LIST;
  payload: Payload<{
    idList?: string;
  }>;
}

export function setIdList(payload: SetIdListAction['payload']): SetIdListAction {
  return {
    type: SET_ID_LIST,
    payload
  }
}

//==============================================================================

export const SET_LOADING_ID_LIST = 'dataset-param/set-loading-id-list';

export interface SetLoadingIdListAction {
  type: typeof SET_LOADING_ID_LIST;
  payload: Payload<{
    loadingIdList?: boolean;
  }>;
}

export function setLoadingIdList(payload: SetLoadingIdListAction['payload']): SetLoadingIdListAction {
  return {
    type: SET_LOADING_ID_LIST,
    payload
  }
}

//==============================================================================

export const SET_FILE = 'dataset-param/set-file';

export interface SetFileAction {
  type: typeof SET_FILE;
  payload: Payload<{
    file?: File | null
  }>;
}

export function setFile(payload: SetFileAction['payload']): SetFileAction {
  return {
    type: SET_FILE,
    payload
  }
}

//==============================================================================

export const SET_STRATEGY_LIST = 'dataset-param/set-strategy-list';

export interface SetStrategyListAction {
  type: typeof SET_STRATEGY_LIST;
  payload: Payload<{
    strategyList: StrategySummary[];
  }>;
}

export function setStrategyList(payload: SetStrategyListAction['payload']): SetStrategyListAction {
  return {
    type: SET_STRATEGY_LIST,
    payload
  }
}

//==============================================================================

export const SET_STRATEGY_ID = 'dataset-param/set-strategy-id';

export interface SetStrategyIdAction {
  type: typeof SET_STRATEGY_ID;
  payload: Payload<{
    strategyId: number;
  }>;
}

export function setStrategyId(payload: SetStrategyIdAction['payload']): SetStrategyIdAction {
  return {
    type: SET_STRATEGY_ID,
    payload
  }
}

//==============================================================================

export const SET_BASKET_COUNT = 'dataset-param/set-basket-count';

export interface SetBasketCountAction {
  type: typeof SET_BASKET_COUNT;
  payload: Payload<{
    basketCount: number;
  }>;
}

export function setBasketCount(payload: SetBasketCountAction['payload']): SetBasketCountAction {
  return {
    type: SET_BASKET_COUNT,
    payload
  };
}

//==============================================================================

export const SET_FILE_PARSER = 'dataset-param/set-file-parser';

export interface SetFileParserAction {
  type: typeof SET_FILE_PARSER;
  payload: Payload<{
    fileParser: DatasetParam['parsers'][number]['name'];
  }>;
}

export function setFileParser(payload: SetFileParserAction['payload']): SetFileParserAction {
  return {
    type: SET_FILE_PARSER,
    payload
  }
}

//==============================================================================

export const SET_URL = 'dataset-param/set-url';

export interface SetUrlAction {
  type: typeof SET_URL;
  payload: Payload<{
    url?: string;
  }>;
}

export function setUrl(payload: SetUrlAction['payload']): SetUrlAction {
  return {
    type: SET_URL,
    payload
  }
}

//==============================================================================

export const SET_URL_PARSER = 'dataset-param/set-url-parser';

export interface SetUrlParserAction {
  type: typeof SET_URL_PARSER;
  payload: Payload<{
    urlParser: DatasetParam['parsers'][number]['name'];
  }>;
}

export function setUrlParser(payload: SetUrlParserAction['payload']): SetUrlParserAction {
  return {
    type: SET_URL_PARSER,
    payload
  }
}

//==============================================================================
