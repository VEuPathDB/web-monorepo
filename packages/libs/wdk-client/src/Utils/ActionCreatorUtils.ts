import { Action } from 'redux';
import { PageTransitioner } from 'wdk-client/Utils/PageTransitioner';
import WdkService from 'wdk-client/Utils/WdkService';


export interface ActionCreatorServices {
  wdkService: WdkService;
  transitioner: PageTransitioner;
}

export type ActionCreatorResult<T extends Action> =
  | T
  | ActionThunk<T>
  | ActionCreatorResultArray<T>
  | ActionCreatorResultPromise<T>;

interface ActionCreatorResultArray<T extends Action> extends Array<ActionCreatorResult<T>> {}

interface ActionCreatorResultPromise<T extends Action> extends Promise<ActionCreatorResult<T>> {}

export interface ActionThunk<T extends Action> {
  (services: ActionCreatorServices): ActionCreatorResult<T>;
}

// The following is used by thunks. When WdkMiddleware encounters this action,
// it will not be dispatched to the store. This allows a thunk to perform a
// side-effect without dispatching a specific action, for better or worse.
export const emptyType = Symbol('empty');

export type EmptyAction = {
  type: typeof emptyType
}

export const emptyAction: EmptyAction = {
  type: emptyType
}

