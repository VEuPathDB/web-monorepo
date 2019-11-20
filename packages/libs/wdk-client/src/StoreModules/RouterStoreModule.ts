import {ActionsObservable, StateObservable} from 'redux-observable';
import {transitionToInternalPage, transitionToExternalPage} from 'wdk-client/Actions/RouterActions';
import {Action} from 'wdk-client/Actions';
import {RootState} from 'wdk-client/Core/State/Types';
import {EpicDependencies} from 'wdk-client/Core/Store';
import {Observable, EMPTY} from 'rxjs';
import {tap, mergeMapTo} from 'rxjs/operators';

export const key = 'router';

export function reduce() {
  return null;
}

export const observe = doTransition;

function doTransition(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    tap(action => {
      if (transitionToInternalPage.isOfType(action)) {
        transitioner.transitionToInternalPage(action.payload.path, action.payload.options);
      }
      if (transitionToExternalPage.isOfType(action)) {
        transitioner.transitionToExternalPage(action.payload.path, action.payload.options);
      }
    }),
    mergeMapTo(EMPTY)
  )
}
