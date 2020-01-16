import { isEqual } from 'lodash';
import { combineEpics, Epic } from 'redux-observable';
import { concat, empty, from, merge, Observable, of } from 'rxjs';
import { debounceTime, filter, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import WdkService from 'wdk-client/Service/WdkService';
import {
  CHANGE_GROUP_VISIBILITY,
  QUESTION_LOADED,
  UNLOAD_QUESTION,
  UPDATE_PARAMS,
  ChangeGroupVisibilityAction,
  QuestionLoadedAction,
  UnloadQuestionAction,
  UpdateParamsAction,
  paramError,
} from 'wdk-client/Actions/QuestionActions';
import { State, QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { FieldState, MemberFieldState, State as FilterParamState } from 'wdk-client/Views/Question/Params/FilterParamNew/State';
import { ModuleEpic, EpicDependencies } from 'wdk-client/Core/Store';
import { isType, getFilters, getFilterFields, isMemberField, sortDistribution } from 'wdk-client/Views/Question/Params/FilterParamNew/FilterParamUtils';
import { UpdateFiltersAction, UPDATE_FILTERS, SetActiveFieldAction, SET_ACTIVE_FIELD, setActiveField, invalidateOntologyTerms, updateFieldState, summaryCountsLoaded } from 'wdk-client/Actions/FilterParamActions';
import { Filter } from 'wdk-client/Components/AttributeFilter/Types';
import { Action } from 'wdk-client/Actions';

const defaultMemberFieldSort: MemberFieldState['sort'] = {
  columnKey: 'value',
  direction: 'asc',
  groupBySelected: false
}

// Observers
// ---------

type Observer = ModuleEpic<State, Action>;

type LoadDeps = {
  paramName: string,
  loadCounts: boolean,
  loadSummaryFor: string | null,
  questionState: QuestionState
};

/**
 * When a Question is loaded, listen for parameter-specific actions and load data as needed.
 */
const observeInit: Observer = (action$, state$, services) => action$.pipe(
  filter((action): action is QuestionLoadedAction => action.type === QUESTION_LOADED),
  mergeMap(action => {
    const { searchName } = action.payload;
    const questionState = getQuestionState(state$.value, searchName);
    if (questionState == null) return empty();
    const { question, paramValues } = questionState;
    const isVisible = (paramName: string) => {
      const state = getQuestionState(state$.value, searchName);
      if (state == null) return false;

      const parameter = getFilterParamNewFromState(state, paramName);
      return state.groupUIState[parameter.group].isVisible;
    }

    // Create an observable per filter param to load ontology term summaries
    // and counts when an active ontology term is changed, or when a param
    // value changes, but only if its group is visible.
    return from(question.parameters).pipe(
      filter(isType),
      map(parameter => ({ paramName: parameter.name, groupName: parameter.group })),
      mergeMap(({paramName, groupName}) => {
        // Create an Observable<FilterParamNew> based on actions
        const valueChangedParameter$: Observable<LoadDeps> = action$.pipe(
          filter((action): action is UpdateFiltersAction => (
            action.type === UPDATE_FILTERS &&
            action.payload.searchName === searchName &&
            action.payload.parameter.name === paramName
          )),
          mergeMap(action => {
            const { prevFilters, filters } = action.payload;
            const questionState = getQuestionState(state$.value, searchName);
            if (questionState == null) return empty() as Observable<LoadDeps>;

            const { activeOntologyTerm, fieldStates } =
              questionState.paramUIState[paramName];
            const loadSummary = activeOntologyTerm != null && (
              fieldStates[activeOntologyTerm].summary == null ||
              !isEqual( prevFilters.filter(f => f.field != activeOntologyTerm)
                      , filters.filter(f => f.field !== activeOntologyTerm) )
            );

            return of({
              questionState,
              paramName,
              loadCounts: true,
              loadSummaryFor: loadSummary ? activeOntologyTerm : null
            });
          }),
          debounceTime(1000)
        );

        const activeOntologyTermChangedParameter$: Observable<LoadDeps> = action$.pipe(
          filter((action): action is SetActiveFieldAction => action.type === SET_ACTIVE_FIELD),
          filter(action => action.payload.searchName === searchName && action.payload.parameter.name === paramName),
          mergeMap(() => {
            const questionState = getQuestionState(state$.value, searchName);
            if (questionState == null) return empty() as Observable<LoadDeps>;

            const { activeOntologyTerm, fieldStates }: FilterParamState = questionState.paramUIState[paramName];
            if (activeOntologyTerm != null && fieldStates[activeOntologyTerm].summary == null) {
              return of({
                paramName,
                loadCounts: true,
                loadSummaryFor: questionState.paramUIState[paramName].activeOntologyTerm,
                questionState
              })
            }
            return empty() as Observable<LoadDeps>;
          })
        );


        const groupVisibilityChangeParameter$: Observable<LoadDeps> = action$.pipe(
          filter((action): action is ChangeGroupVisibilityAction => action.type === CHANGE_GROUP_VISIBILITY),
          filter(action => action.payload.searchName === searchName && action.payload.groupName === groupName),
          mergeMap(() => {
            const questionState = getQuestionState(state$.value, searchName);
            if (questionState == null) return empty() as Observable<LoadDeps>;

            const { activeOntologyTerm, fieldStates }: FilterParamState = questionState.paramUIState[paramName];
            if (activeOntologyTerm != null && fieldStates[activeOntologyTerm].summary == null) {
              return of({
                paramName,
                loadCounts: true,
                loadSummaryFor: activeOntologyTerm,
                questionState
              })
            }
            return empty() as Observable<LoadDeps>;
          })
        );

        const parameter$ = merge(
          valueChangedParameter$,
          activeOntologyTermChangedParameter$,
          groupVisibilityChangeParameter$
        ).pipe(
          filter(({ paramName }) => isVisible(paramName)),
          switchMap(({ paramName, loadCounts, loadSummaryFor, questionState }) => {
            return merge(
              loadCounts
                ? getSummaryCounts(services.wdkService, paramName, questionState)
                : empty(),
              loadSummaryFor
                ? getOntologyTermSummary(services.wdkService, paramName, questionState, loadSummaryFor)
                : empty()
            ) as Observable<Action>;
          })
        );

        const filters = getFilters(paramValues[paramName]);
        const activeField = filters.length === 0
          ? getFilterFields(getFilterParamNewFromState(getQuestionState(state$.value, searchName), paramName)).first().term
          : filters[0].field;

        // The order here is important. We want to first merge the child
        // observers. THEN we want to merge the Observable of
        // ActiveFieldSetAction. This will ensure that child observers
        // receives that action.
        return merge(
          parameter$,
          of(setActiveField({
            searchName,
            parameter: getFilterParamNewFromState(questionState, paramName),
            paramValues,
            activeField
          }))
        );
      }),
      takeUntil(getUnloadQuestionStream(action$, searchName))
    );
  })
);

const observeUpdateDependentParamsActiveField: Observer = (action$, state$, { wdkService }) => action$.pipe(
  filter((action): action is UpdateParamsAction => action.type === UPDATE_PARAMS),
  switchMap(action => {
    const { searchName, parameters } = action.payload;
    return from(parameters).pipe(
      filter(isType),
      mergeMap(parameter => {
        const questionState = getQuestionState(state$.value, searchName);
        if (questionState == null) return empty() as Observable<Action>;
        const { paramValues, paramUIState } = questionState;
        const { activeOntologyTerm } = paramUIState[parameter.name] as FilterParamState;
        const { ontology } = parameter;
        const filters = getFilters(paramValues[parameter.name]);

        const activeField = ontology.findIndex(item => item.term === activeOntologyTerm) > -1
          ? activeOntologyTerm
          : filters.length === 0 ? getFilterFields(parameter).first().term : filters[0].field;

        return merge(
          of(invalidateOntologyTerms({
            searchName,
            parameter,
            paramValues,
            retainedFields: [/* activeOntologyTerm */]
          })),
          activeField ? getOntologyTermSummary(wdkService, parameter.name, questionState, activeField) : empty() as Observable<Action>,
          getSummaryCounts(wdkService, parameter.name, questionState)
        );
      }),
      takeUntil(getUnloadQuestionStream(action$, searchName))
    )

  })
);

const observeParam: Epic<Action, Action, State, EpicDependencies> =
  combineEpics<Epic<Action, Action, State>>(observeInit, observeUpdateDependentParamsActiveField);

export default observeParam;

// Helpers
// -------

function getUnloadQuestionStream(action$: Observable<Action>, searchName: string): Observable<Action> {
  return action$.pipe(
    filter((action): action is UnloadQuestionAction => action.type === UNLOAD_QUESTION),
    filter(action => action.payload.searchName === searchName)
  );
}

function getOntologyTermSummary(
  wdkService: WdkService,
  paramName: string,
  state: QuestionState,
  ontologyTerm: string
): Observable<Action> {
  const { question, paramValues } = state;
  const searchName = question.urlSegment;
  const parameter = getFilterParamNewFromState(state, paramName);

  if (ontologyTerm == null) return empty();

  // FIXME Add loading and invalid for fieldState
  const filters = (JSON.parse(paramValues[parameter.name]).filters as Filter[])
    .filter(filter => filter.field !== ontologyTerm);
  return concat(
    of(updateFieldState({
      searchName,
      parameter,
      paramValues,
      field: ontologyTerm,
      fieldState: {
        loading: true
      }
    })),
    wdkService.getOntologyTermSummary(searchName, parameter.name, filters, ontologyTerm, paramValues).then(
      summary => {
        const fieldState: FieldState = isMemberField(parameter, ontologyTerm)
          ? {
            invalid: false,
            loading: false,
            sort: defaultMemberFieldSort,
            searchTerm: '',
            summary: {
              ...summary,
              valueCounts: sortDistribution(summary.valueCounts, defaultMemberFieldSort)
            }
          }
          : {
            invalid: false,
            loading: false,
            summary: summary
          };

        return updateFieldState({
          searchName,
          parameter,
          paramValues,
          field: ontologyTerm,
          fieldState
        })
      },
      error => {
        console.error(error);
        return updateFieldState({
          searchName,
          parameter,
          paramValues,
          field: ontologyTerm,
          fieldState: {
            invalid: false,
            loading: false,
            errorMessage: 'Unable to load summary for "' + ontologyTerm + '".'
          }
        });
      }
    )
  );
}

function getSummaryCounts(
  wdkService: WdkService,
  paramName: string,
  state: QuestionState
): Observable<Action> {
  const { question, paramValues } = state;
  const searchName = question.urlSegment;
  const parameter = getFilterParamNewFromState(state, paramName);
  const filters = JSON.parse(paramValues[paramName]).filters;

  return from(wdkService.getFilterParamSummaryCounts(searchName, paramName, filters, paramValues).then(
    counts => summaryCountsLoaded({
      searchName,
      parameter,
      paramValues,
      ...counts
    }),
    error => paramError({
      searchName,
      error,
      paramName
    })
  ));
}



function getQuestionState(state: State, searchName: string) {
  const questionState = state.questions[searchName];
  if (questionState == null) throw new Error(`Question ${searchName} does not exist in store state.`);
  return questionState;
}

function getFilterParamNewFromState(state: QuestionState, paramName: string) {
  const parameter = state.question.parametersByName[paramName];
  if (parameter == null || parameter.type !== 'filter') {
    throw new Error(`Parameter ${paramName} in ${state.question.urlSegment} is not a FilterParamNew.`);
  }
  return parameter;
}
