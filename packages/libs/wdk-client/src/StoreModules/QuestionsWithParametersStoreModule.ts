import { QuestionWithParameters } from 'wdk-client/Utils/WdkModel';
import { Action } from 'wdk-client/Actions';
import { fulfillQuestionWithParameters, requestQuestionWithParameters } from 'wdk-client/Actions/QuestionWithParametersActions';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { Observable } from 'rxjs';
import { RootState } from 'wdk-client/Core/State/Types';
import { mergeMap, filter, map, distinct } from 'rxjs/operators';

interface State {
  [Key: string]: QuestionWithParameters | undefined;
}

export const key = 'questionsWithParameters';

export function reduce(state: State = {}, action: Action): State {
  switch(action.type) {
    case fulfillQuestionWithParameters.type:
      return {
        ...state,
        [action.payload.name]: action.payload.questionWithParameters
      };

    default:
      return state;
  }
}

export function observe(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, deps: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(requestQuestionWithParameters.isOfType),
    map(action => action.payload.name),
    // Only request a question from the REST service once, no matter how many times it is requested.
    distinct(),
    mergeMap(async name => {
      const question = await deps.wdkService.getQuestionAndParameters(name);
      return fulfillQuestionWithParameters(name, question);
    })
  )
}