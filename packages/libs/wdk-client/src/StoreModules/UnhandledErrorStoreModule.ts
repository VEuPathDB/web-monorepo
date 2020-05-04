import { Action } from 'wdk-client/Actions';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Observable, EMPTY } from 'rxjs';
import { filter, tap, mergeMapTo } from 'rxjs/operators';
import { notifyUnhandledError, clearUnhandledErrors } from 'wdk-client/Actions/UnhandledErrorActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';

export const key = 'unhandledErrors';

export interface State {
  errors: any[]
}

const initialState: State = {
  errors: []
}

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {
    case notifyUnhandledError.type:
      return {
        ...state,
        errors: [ ...state.errors, action.payload.error ]
      }
    case clearUnhandledErrors.type:
      return {
        errors: []
      };
    default:
      return state;
  }
}

export function observe(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(notifyUnhandledError.isOfType),
    tap(error => {
      wdkService.submitErrorIfNot500(error instanceof Error ? error : new Error(String(error)));
    }),
    mergeMapTo(EMPTY)
  )
}
