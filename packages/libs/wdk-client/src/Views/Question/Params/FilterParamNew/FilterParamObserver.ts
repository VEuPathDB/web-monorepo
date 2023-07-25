import { isEqual, partition } from 'lodash';
import { combineEpics, Epic } from 'redux-observable';
import { concat, EMPTY, from, merge, Observable, of } from 'rxjs';
import {
  debounceTime,
  filter,
  mergeMap,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import WdkService from '../../../../Service/WdkService';
import {
  CHANGE_GROUP_VISIBILITY,
  UNLOAD_QUESTION,
  UPDATE_DEPENDENT_PARAMS,
  ChangeGroupVisibilityAction,
  UnloadQuestionAction,
  UpdateDependentParamsAction,
  paramError,
  InitParamAction,
  INIT_PARAM,
  updateParamValue,
} from '../../../../Actions/QuestionActions';
import {
  State,
  QuestionState,
} from '../../../../StoreModules/QuestionStoreModule';
import {
  FilterParamNew,
  ParameterValues,
  Parameter,
} from '../../../../Utils/WdkModel';

import {
  FieldState,
  MemberFieldState,
  MultiFieldState,
  State as FilterParamState,
} from '../../../../Views/Question/Params/FilterParamNew/State';
import { ModuleEpic, EpicDependencies } from '../../../../Core/Store';
import {
  isType,
  getFilters,
  getFilterFields,
  isMemberField,
  sortDistribution,
  sortMultiFieldSummary,
} from '../../../../Views/Question/Params/FilterParamNew/FilterParamUtils';
import {
  UpdateFieldStateAction,
  UpdateFiltersAction,
  UPDATE_FILTERS,
  SetActiveFieldAction,
  SET_ACTIVE_FIELD,
  setActiveField,
  invalidateOntologyTerms,
  updateFieldState,
  summaryCountsLoaded,
  updateFilters,
} from '../../../../Actions/FilterParamActions';
import {
  Filter,
  MultiFilter,
} from '../../../../Components/AttributeFilter/Types';
import { Action } from '../../../../Actions';
import {
  isMulti,
  getLeavesOfSubTree,
} from '../../../../Components/AttributeFilter/AttributeFilterUtils';

const defaultMultiFieldSort: MultiFieldState['sort'] = {
  columnKey: 'display',
  direction: 'asc',
};

const defaultMemberFieldSort_asc: MemberFieldState['sort'] = {
  columnKey: 'value',
  direction: 'asc',
  groupBySelected: false,
};

const defaultMemberFieldSort_desc: MemberFieldState['sort'] = {
  columnKey: 'value',
  direction: 'desc',
  groupBySelected: false,
};

// Observers
// ---------

type Observer = ModuleEpic<State, Action>;

type LoadDeps = {
  paramName: string;
  loadCounts: boolean;
  loadSummaryFor: string | null;
};

const observeInitialParamData: Observer = (action$, state$, services) => {
  return action$.pipe(
    filter((action): action is InitParamAction => action.type === INIT_PARAM),
    mergeMap((action) => {
      const { initialParamData, parameter, paramValues, searchName } =
        action.payload;
      if (parameter.type !== 'filter') return EMPTY;
      // look for keys that inidicate a shorthand filter
      const filterKeyPrefix = `${parameter.name}.`;
      const filters: Filter[] = [];
      for (const key in initialParamData) {
        if (key.startsWith(filterKeyPrefix)) {
          const fieldName = key.replace(filterKeyPrefix, '');
          const field = parameter.ontology.find(
            (entry) => entry.term === fieldName
          );
          if (field?.type == null) return EMPTY;
          const filterValueRaw = initialParamData[key];
          const value = (() => {
            if (field.isRange) {
              const [min, max] = filterValueRaw
                .split('..')
                .map((v) => (field.type === 'number' ? Number(v) : v));
              return { min, max };
            } else {
              return filterValueRaw
                .split(/\s*,\s*/)
                .map((v) => (field.type === 'number' ? Number(v) : v));
            }
          })();
          filters.push({
            field: fieldName,
            includeUnknown: false,
            isRange: field.isRange,
            type: field.type,
            value: value,
          } as Filter);
        }
      }
      // If filters is empty, assume there is no initialParamData for this param.
      if (filters.length === 0) return EMPTY;
      return of(
        updateParamValue({
          paramValue: JSON.stringify({ filters }),
          paramValues,
          parameter,
          searchName,
        }),
        updateFilters({
          prevFilters: [],
          filters,
          paramValues,
          parameter,
          searchName,
        })
      );
    })
  );
};

/**
 * When a Question is loaded, listen for parameter-specific actions and load data as needed.
 */
const observeQuestionLoaded: Observer = (action$, state$, services) =>
  action$.pipe(
    filter((action): action is InitParamAction => action.type === INIT_PARAM),
    mergeMap((action) => {
      const { searchName, parameter } = action.payload;
      const questionState = getQuestionState(state$.value, searchName);
      if (questionState == null || !isType(parameter)) return EMPTY;
      const isVisible = (paramName: string) => {
        const state = getQuestionState(state$.value, searchName);
        if (state == null) return false;

        const parameter = getFilterParamNewFromState(state, paramName);
        return state.groupUIState[parameter.group].isVisible;
      };

      const paramName = parameter.name;
      const groupName = parameter.group;

      // Create an Observable<FilterParamNew> based on actions
      const valueChangedParameter$: Observable<LoadDeps> = action$.pipe(
        filter(
          (action): action is UpdateFiltersAction =>
            action.type === UPDATE_FILTERS &&
            action.payload.searchName === searchName &&
            action.payload.parameter.name === paramName
        ),
        mergeMap((action) => {
          const { prevFilters, filters } = action.payload;
          const questionState = getQuestionState(state$.value, searchName);
          if (questionState == null) return EMPTY as Observable<LoadDeps>;

          const { activeOntologyTerm, fieldStates } =
            questionState.paramUIState[paramName];
          const loadSummary =
            activeOntologyTerm != null &&
            (fieldStates[activeOntologyTerm]?.summary == null ||
              !isEqual(
                prevFilters.filter((f) => f.field != activeOntologyTerm),
                filters.filter((f) => f.field !== activeOntologyTerm)
              ));

          return of({
            paramName,
            loadCounts: true,
            loadSummaryFor: loadSummary ? activeOntologyTerm : null,
          });
        }),
        debounceTime(1000)
      );

      const activeOntologyTermChangedParameter$: Observable<LoadDeps> =
        action$.pipe(
          filter(
            (action): action is SetActiveFieldAction =>
              action.type === SET_ACTIVE_FIELD
          ),
          filter(
            (action) =>
              action.payload.searchName === searchName &&
              action.payload.parameter.name === paramName
          ),
          mergeMap(() => {
            const questionState = getQuestionState(state$.value, searchName);
            if (questionState == null) return EMPTY as Observable<LoadDeps>;

            const { activeOntologyTerm, fieldStates }: FilterParamState =
              questionState.paramUIState[paramName];
            if (
              activeOntologyTerm != null &&
              (fieldStates[activeOntologyTerm]?.summary == null ||
                fieldStates[activeOntologyTerm]?.invalid)
            ) {
              return of({
                paramName,
                loadCounts: true,
                loadSummaryFor:
                  questionState.paramUIState[paramName].activeOntologyTerm,
              });
            }
            return EMPTY as Observable<LoadDeps>;
          })
        );

      const groupVisibilityChangeParameter$: Observable<LoadDeps> =
        action$.pipe(
          filter(
            (action): action is ChangeGroupVisibilityAction =>
              action.type === CHANGE_GROUP_VISIBILITY
          ),
          filter(
            (action) =>
              action.payload.searchName === searchName &&
              action.payload.groupName === groupName
          ),
          mergeMap(() => {
            const questionState = getQuestionState(state$.value, searchName);
            if (questionState == null) return EMPTY as Observable<LoadDeps>;

            const { activeOntologyTerm, fieldStates }: FilterParamState =
              questionState.paramUIState[paramName];
            if (
              activeOntologyTerm != null &&
              (fieldStates[activeOntologyTerm]?.summary == null ||
                fieldStates[activeOntologyTerm]?.invalid)
            ) {
              return of({
                paramName,
                loadCounts: true,
                loadSummaryFor: activeOntologyTerm,
              });
            }
            return EMPTY as Observable<LoadDeps>;
          })
        );

      const parameter$ = merge(
        valueChangedParameter$,
        activeOntologyTermChangedParameter$,
        groupVisibilityChangeParameter$
      ).pipe(
        filter(({ paramName }) => isVisible(paramName)),
        switchMap(({ paramName, loadCounts, loadSummaryFor }) => {
          const questionState = getQuestionState(state$.value, searchName);
          if (questionState == null) return EMPTY as Observable<LoadDeps>;
          return merge(
            loadCounts
              ? getSummaryCounts(services.wdkService, paramName, questionState)
              : EMPTY,
            loadSummaryFor
              ? getOntologyTermSummary(
                  services.wdkService,
                  paramName,
                  questionState,
                  loadSummaryFor
                )
              : EMPTY
          ) as Observable<Action>;
        }),
        takeUntil(getUnloadQuestionStream(action$, searchName))
      );

      const filters = getFilters(
        getQuestionState(state$.value, searchName).paramValues[paramName]
      );
      const activeField =
        filters.length === 0
          ? getFilterFields(
              getFilterParamNewFromState(
                getQuestionState(state$.value, searchName),
                paramName
              )
            ).first()?.term
          : filters[0].field;

      // The order here is important. We want to first merge the child
      // observers. THEN we want to merge the Observable of
      // ActiveFieldSetAction. This will ensure that child observers
      // receives that action.
      return merge(
        parameter$,
        of(
          setActiveField({
            searchName,
            parameter: getFilterParamNewFromState(questionState, paramName),
            paramValues: getQuestionState(state$.value, searchName).paramValues,
            activeField,
          })
        )
      ) as Observable<Action>;
    })
  );

const observeUpdateDependentParamsActiveField: Observer = (
  action$,
  state$,
  { wdkService }
) =>
  action$.pipe(
    filter(
      (action): action is UpdateDependentParamsAction =>
        action.type === UPDATE_DEPENDENT_PARAMS
    ),
    mergeMap((action: UpdateDependentParamsAction) => {
      const { searchName, updatedParameter } = action.payload;
      const questionState = getQuestionState(state$.value, searchName);
      if (questionState == null) return EMPTY as Observable<Action>;
      const { paramValues, paramUIState } = questionState;
      const dependentParameters = getAllDependencies(
        updatedParameter,
        questionState.question.parametersByName
      );
      return from(dependentParameters).pipe(
        filter(isType),
        mergeMap((parameter) => {
          const { activeOntologyTerm } = paramUIState[
            parameter.name
          ] as FilterParamState;
          const { ontology } = parameter;
          const filters = getFilters(paramValues[parameter.name]);

          const activeField =
            ontology.findIndex((item) => item.term === activeOntologyTerm) > -1
              ? activeOntologyTerm
              : filters.length === 0
              ? getFilterFields(parameter).first()?.term
              : filters[0].field;

          const belongsToVisibleGroup =
            questionState.groupUIState[parameter.group].isVisible;

          return merge(
            of(
              invalidateOntologyTerms({
                searchName,
                parameter,
                paramValues,
                retainedFields: [
                  /* activeOntologyTerm */
                ],
                activeOntologyTerm: activeField,
              })
            ),
            activeField && belongsToVisibleGroup
              ? getOntologyTermSummary(
                  wdkService,
                  parameter.name,
                  questionState,
                  activeField
                )
              : (EMPTY as Observable<Action>),
            belongsToVisibleGroup
              ? getSummaryCounts(wdkService, parameter.name, questionState)
              : (EMPTY as Observable<Action>)
          );
        }),
        takeUntil(getUnloadQuestionStream(action$, searchName))
      );
    })
  );

/** Recursively find all dependencies of a given parameter. */
function getAllDependencies(
  parameter: Parameter,
  parameters: Record<string, Parameter>
): Parameter[] {
  return parameter.dependentParams.flatMap((dependentParamName) => {
    const dependentParameter = parameters[dependentParamName];
    return [dependentParameter].concat(
      getAllDependencies(parameters[dependentParamName], parameters)
    );
  });
}

const observeParam: Epic<Action, Action, State, EpicDependencies> =
  combineEpics<Epic<Action, Action, State>>(
    observeQuestionLoaded,
    observeUpdateDependentParamsActiveField,
    observeInitialParamData
  );

export default observeParam;

// Helpers
// -------

function getUnloadQuestionStream(
  action$: Observable<Action>,
  searchName: string
): Observable<Action> {
  return action$.pipe(
    filter(
      (action): action is UnloadQuestionAction =>
        action.type === UNLOAD_QUESTION
    ),
    filter((action) => action.payload.searchName === searchName)
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

  if (ontologyTerm == null) return EMPTY;
  // FIXME Add loading and invalid for fieldState
  const filtersIncludingThisOne = JSON.parse(paramValues[parameter.name])
    .filters as Filter[];
  const filters = filtersIncludingThisOne.filter(
    (filter) => filter.field !== ontologyTerm
  );

  const ontologyItem = parameter.ontology.find(
    (item) => item.term === ontologyTerm
  )!;

  if (isMulti(ontologyItem)) {
    const leafTerms = getLeavesOfSubTree(parameter.ontology, ontologyItem).map(
      (item) => item.term
    );

    const sort =
      state.paramUIState[paramName]?.fieldStates[ontologyTerm]?.sort ||
      defaultMultiFieldSort;

    const [[firstFilter], otherFilters] = partition(
      filtersIncludingThisOne,
      (filter) => filter.field === ontologyTerm
    );
    const multiFilter = firstFilter as MultiFilter;

    const getSummaries = Promise.all(
      leafTerms.map((leafTerm) => {
        const filtersForThisLeaf = otherFilters.concat(
          multiFilter == null || multiFilter.value.operation === 'union'
            ? []
            : multiFilter.value.filters.filter(
                (filter) => filter.field !== leafTerm
              )
        );
        return wdkService
          .getOntologyTermSummary(
            searchName,
            parameter.name,
            filtersForThisLeaf,
            leafTerm,
            paramValues
          )
          .then((summary) => ({ ...summary, term: leafTerm }));
      })
    );

    return concat(
      of(
        updateFieldState({
          searchName,
          parameter,
          paramValues,
          field: ontologyTerm,
          fieldState: {
            loading: true,
          },
        })
      ),
      from(
        getSummaries.then((summaries) =>
          updateFieldState({
            searchName,
            parameter,
            paramValues,
            field: ontologyTerm,
            fieldState: {
              loading: false,
              invalid: false,
              sort,
              leafSummaries: sortMultiFieldSummary(
                summaries,
                parameter.ontology,
                sort
              ),
              searchTerm: '',
            },
          })
        )
      )
    );
  } else {
    return updateOntologyTermSummary(
      wdkService,
      searchName,
      parameter,
      paramValues,
      ontologyTerm,
      filters
    );
  }
}
function updateOntologyTermSummary(
  wdkService: WdkService,
  searchName: string,
  parameter: FilterParamNew,
  paramValues: ParameterValues,
  ontologyTerm: string,
  filters: Filter[]
): Observable<UpdateFieldStateAction> {
  return concat(
    of(
      updateFieldState({
        searchName,
        parameter,
        paramValues,
        field: ontologyTerm,
        fieldState: {
          loading: true,
        },
      })
    ),
    wdkService
      .getOntologyTermSummary(
        searchName,
        parameter.name,
        filters,
        ontologyTerm,
        paramValues
      )
      .then(
        (summary) => {
          const ontologyItem = parameter.ontology.find(
            (field) => field.term === ontologyTerm
          );
          const sort =
            ontologyItem?.type === 'number'
              ? defaultMemberFieldSort_desc
              : defaultMemberFieldSort_asc;
          const fieldState: FieldState = isMemberField(parameter, ontologyTerm)
            ? {
                invalid: false,
                loading: false,
                sort,
                currentPage: 1,
                rowsPerPage: 100,
                searchTerm: '',
                summary: {
                  ...summary,
                  valueCounts: sortDistribution(summary.valueCounts, sort),
                },
              }
            : {
                invalid: false,
                loading: false,
                summary: summary,
              };

          return updateFieldState({
            searchName,
            parameter,
            paramValues,
            field: ontologyTerm,
            fieldState,
          });
        },
        (error) => {
          console.error(error);
          return updateFieldState({
            searchName,
            parameter,
            paramValues,
            field: ontologyTerm,
            fieldState: {
              invalid: false,
              loading: false,
              errorMessage:
                'Unable to load summary for "' + ontologyTerm + '".',
            },
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

  return from(
    wdkService
      .getFilterParamSummaryCounts(searchName, paramName, filters, paramValues)
      .then(
        (counts) =>
          summaryCountsLoaded({
            searchName,
            parameter,
            paramValues,
            ...counts,
          }),
        (error) =>
          paramError({
            searchName,
            error,
            paramName,
          })
      )
  );
}

function getQuestionState(state: State, searchName: string) {
  const questionState = state.questions[searchName];
  if (questionState == null)
    throw new Error(`Question ${searchName} does not exist in store state.`);
  return questionState;
}

function getFilterParamNewFromState(state: QuestionState, paramName: string) {
  const parameter = state.question.parametersByName[paramName];
  if (parameter == null || parameter.type !== 'filter') {
    throw new Error(
      `Parameter ${paramName} in ${state.question.urlSegment} is not a FilterParamNew.`
    );
  }
  return parameter;
}
