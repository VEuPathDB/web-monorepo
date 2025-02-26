import { Action } from 'redux';

import {
  ActionCreatorResult,
  ActionCreatorServices,
} from '../Core/WdkMiddleware';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface SimpleDispatch {
  (action: Action): void;
}

export interface DispatchAction<
  S extends ActionCreatorServices = ActionCreatorServices
> {
  (action: ActionCreatorResult<Action, S>): any;
}
