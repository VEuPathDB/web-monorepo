import { EMPTY } from 'rxjs';
import { filter, mergeMapTo, tap } from 'rxjs/operators';
import { ActionsObservable, StateObservable } from 'redux-observable';

import { submitQuestion } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { Action } from '@veupathdb/wdk-client/lib/Actions';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import { isOrganismParam } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
import {
  ORGANISM_PREFERENCE_SCOPE,
  ORGANISM_PARAM_PREF_KEY,
} from '@veupathdb/preferred-organisms/lib/utils/preferredOrganisms';

export const key = 'organismParamPreference';

export function reduce(state = {}) {
  return state;
}

export function observe(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
) {
  return action$.pipe(
    filter(submitQuestion.isOfType),
    tap((action) => {
      const questionState =
        state$.value.question?.questions[action.payload.searchName];
      if (!questionState) return;

      const organismParam =
        questionState.question.parameters.find(isOrganismParam);
      if (!organismParam) return;

      const value = questionState.paramValues[organismParam.name];
      if (!value) return;

      wdkService.patchScopedUserPreferences(ORGANISM_PREFERENCE_SCOPE, {
        [ORGANISM_PARAM_PREF_KEY]: value,
      });
    }),
    mergeMapTo(EMPTY)
  );
}
