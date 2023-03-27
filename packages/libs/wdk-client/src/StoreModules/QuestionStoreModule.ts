import { keyBy, mapValues, toString } from 'lodash';
import { Seq } from '../Utils/IterableUtils';
import {
  combineEpics,
  ofType,
  StateObservable,
  ActionsObservable,
} from 'redux-observable';
import { EMPTY, Observable, Subject, from, merge, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  concatMap,
  filter,
  map,
  mergeAll,
  mergeMap,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import {
  UNLOAD_QUESTION,
  UPDATE_ACTIVE_QUESTION,
  QUESTION_LOADED,
  QUESTION_ERROR,
  QUESTION_NOT_FOUND,
  UPDATE_CUSTOM_QUESTION_NAME,
  UPDATE_QUESTION_WEIGHT,
  UPDATE_PARAM_VALUE,
  PARAM_ERROR,
  UPDATE_DEPENDENT_PARAMS,
  UPDATE_PARAM_STATE,
  CHANGE_GROUP_VISIBILITY,
  GROUP_COUNT_LOADED,
  groupCountLoaded,
  ChangeGroupVisibilityAction,
  UpdateActiveQuestionAction,
  QuestionLoadedAction,
  initParam,
  UpdateParamValueAction,
  updateDependentParams,
  paramError,
  SubmitQuestionAction,
  questionLoaded,
  questionNotFound,
  questionError,
  ENABLE_SUBMISSION,
  reportSubmissionError,
  submitQuestion,
  SubmissionMetadata,
} from '../Actions/QuestionActions';

import {
  Parameter,
  ParameterGroup,
  QuestionWithParameters,
  RecordClass,
  ParameterValues,
} from '../Utils/WdkModel';

import {
  observeParam,
  reduce as paramReducer,
  getValueFromState,
} from '../Views/Question/Params';

import { EpicDependencies, ModuleEpic } from '../Core/Store';
import { Action } from '../Actions';
import WdkService from '../Service/WdkService';
import { RootState } from '../Core/State/Types';
import {
  requestCreateStrategy,
  requestPutStrategyStepTree,
  requestReviseStep,
  fulfillCreateStrategy,
} from '../Actions/StrategyActions';
import { addStep } from '../Utils/StrategyUtils';
import { Step, extractParamValues } from '../Utils/WdkUser';
import { transitionToInternalPage } from '../Actions/RouterActions';
import {
  InferAction,
  mergeMapRequestActionsToEpic as mrate,
} from '../Utils/ActionCreatorUtils';
import { ParamValueStore } from '../Utils/ParamValueStore';

export const key = 'question';

// Defaults
export const DEFAULT_STRATEGY_NAME = 'Unnamed Search Strategy';
export const DEFAULT_STEP_WEIGHT = 10;

export type FilteredCountState = 'initial' | 'loading' | 'invalid' | number;

export type GroupState = {
  isVisible: boolean;
  filteredCountState: FilteredCountState;
};

export type QuestionWithMappedParameters = QuestionWithParameters & {
  parametersByName: Record<string, Parameter>;
  groupsByName: Record<string, ParameterGroup>;
};

export type QuestionState = {
  questionStatus: 'loading' | 'error' | 'not-found' | 'complete';
  question: QuestionWithMappedParameters;
  recordClass: RecordClass;
  paramValues: ParameterValues;
  defaultParamValues: ParameterValues;
  paramUIState: Record<string, any>;
  groupUIState: Record<string, GroupState>;
  paramErrors: Record<string, string | undefined>;
  stepId: number | undefined;
  weight?: string;
  customName?: string;
  stepValidation?: Step['validation'];
  submitting: boolean;
  paramsUpdatingDependencies: Record<string, boolean>;
};

export type State = {
  questions: Record<string, QuestionState | undefined>;
};

const initialState: State = {
  questions: {},
};

export function reduce(state: State = initialState, action: Action): State {
  if (
    'payload' in action &&
    action.payload != null &&
    typeof action.payload === 'object'
  ) {
    if ('searchName' in action.payload) {
      const { searchName } = action.payload;
      const questionState = reduceQuestionState(
        state.questions[searchName],
        action
      );
      if (questionState !== state.questions[searchName]) {
        return {
          ...state,
          questions: {
            ...state.questions,
            [searchName]: questionState,
          },
        };
      }
    }
  }

  return state;
}

export const observe = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  dependencies: EpicDependencies
) => {
  const questionState$ = new StateObservable(
    state$.pipe(map((state) => state[key])) as Subject<State>,
    state$.value[key]
  );

  return merge(
    observeQuestion(action$, state$, dependencies),
    observeParam(action$, questionState$, dependencies)
  );
};

function reduceQuestionState(
  state = {} as QuestionState,
  action: Action
): QuestionState | undefined {
  switch (action.type) {
    case UNLOAD_QUESTION:
      return undefined;

    case UPDATE_ACTIVE_QUESTION:
      return {
        ...state,
        stepId: action.payload.stepId,
        questionStatus: 'loading',
        submitting: false,
        paramsUpdatingDependencies: {},
      };

    case QUESTION_LOADED:
      return {
        ...state,
        questionStatus: 'complete',
        question: normalizeQuestion(action.payload.question),
        stepValidation: action.payload.stepValidation,
        recordClass: action.payload.recordClass,
        paramValues: action.payload.paramValues,
        defaultParamValues: action.payload.defaultParamValues,
        paramErrors: action.payload.question.parameters.reduce(
          (paramValues, param) =>
            Object.assign(paramValues, { [param.name]: undefined }),
          {}
        ),
        paramUIState: action.payload.question.parameters.reduce(
          (paramUIState, parameter) =>
            Object.assign(paramUIState, {
              [parameter.name]: paramReducer(parameter, undefined, {
                type: '@@parm-stub@@',
              }),
            }),
          {}
        ),
        groupUIState: action.payload.question.groups.reduce(
          (groupUIState, group) =>
            Object.assign(groupUIState, {
              [group.name]: {
                isVisible: group.isVisible,
                filteredCountState: 'initial',
              },
            }),
          {
            __total__: {
              isVisible: false,
              filteredCountState: 'initial',
            },
          }
        ),
        weight: toString(action.payload.wdkWeight),
        customName: toString(action.payload.customName),
      };

    case QUESTION_ERROR:
      return {
        ...state,
        questionStatus: 'error',
      };

    case QUESTION_NOT_FOUND:
      return {
        ...state,
        questionStatus: 'not-found',
      };

    case UPDATE_CUSTOM_QUESTION_NAME:
      return {
        ...state,
        customName: action.payload.customName,
      };

    case UPDATE_QUESTION_WEIGHT:
      return {
        ...state,
        weight: action.payload.weight,
      };

    case UPDATE_PARAM_VALUE:
      const groupIx = state.question.groups.findIndex(
        (group) => group.name === action.payload.parameter.group
      );

      const newGroupUIState = state.question.groups
        .slice(groupIx)
        .map((group) => group.name)
        .reduce((memo, groupName) => {
          const { isVisible, filteredCountState } =
            state.groupUIState[groupName];
          return Object.assign({
            ...memo,
            [groupName]: {
              isVisible,
              filteredCountState: isVisible
                ? 'loading'
                : filteredCountState === 'initial'
                ? 'initial'
                : 'invalid',
            },
          });
        }, {} as QuestionState['groupUIState']);

      return {
        ...state,
        paramValues: {
          ...state.paramValues,
          [action.payload.parameter.name]: action.payload.paramValue,
        },
        paramErrors: {
          ...state.paramErrors,
          [action.payload.parameter.name]: undefined,
        },
        paramsUpdatingDependencies: {
          ...state.paramsUpdatingDependencies,
          [action.payload.parameter.name]: true,
        },
        groupUIState: {
          ...state.groupUIState,
          ...newGroupUIState,
        },
      };

    case PARAM_ERROR:
      return {
        ...state,
        paramErrors: {
          ...state.paramErrors,
          [action.payload.paramName]: action.payload.error,
        },
      };

    case UPDATE_DEPENDENT_PARAMS: {
      const newParamsByName = keyBy(
        action.payload.refreshedDependentParameters,
        'name'
      );
      const newParamValuesByName = mapValues(
        newParamsByName,
        (param) => param.initialDisplayValue || ''
      );
      const newParamErrors = mapValues(newParamsByName, () => undefined);
      // merge updated parameters into question and reset their values
      return {
        ...state,
        paramValues: {
          ...state.paramValues,
          ...newParamValuesByName,
        },
        paramErrors: {
          ...state.paramErrors,
          ...newParamErrors,
        },
        question: {
          ...state.question,
          parametersByName: {
            ...state.question.parametersByName,
            ...newParamsByName,
          },
          parameters: state.question.parameters.map(
            (parameter) => newParamsByName[parameter.name] || parameter
          ),
        },
        paramsUpdatingDependencies: {
          ...state.paramsUpdatingDependencies,
          [action.payload.updatedParameter.name]: false,
        },
      };
    }

    case UPDATE_PARAM_STATE:
      return {
        ...state,
        paramUIState: {
          ...state.paramUIState,
          [action.payload.paramName]: action.payload.paramState,
        },
      };

    case CHANGE_GROUP_VISIBILITY:
      const { filteredCountState } =
        state.groupUIState[action.payload.groupName];
      return {
        ...state,
        groupUIState: {
          ...state.groupUIState,
          [action.payload.groupName]: {
            filteredCountState:
              (filteredCountState === 'initial' ||
                filteredCountState === 'invalid') &&
              action.payload.isVisible
                ? 'loading'
                : filteredCountState,
            isVisible: action.payload.isVisible,
          },
        },
      };

    case submitQuestion.type: {
      return {
        ...state,
        submitting: true,
      };
    }

    case ENABLE_SUBMISSION: {
      return {
        ...state,
        submitting: false,
        stepValidation: action.payload.stepValidation
          ? action.payload.stepValidation
          : state.stepValidation,
      };
    }
    case GROUP_COUNT_LOADED: {
      /*
       * Use the arriving count only if the count is valid
       * to resolve a sequence of load, invalidate, loaded
       * which can happen if a param value is updated, its group navigated away from, and the param value updated again
       */
      const o = state.groupUIState[action.payload.groupName];
      return o == null
        ? state
        : {
            ...state,
            groupUIState: {
              ...state.groupUIState,
              [action.payload.groupName]: {
                isVisible: o.isVisible,
                filteredCountState:
                  o.filteredCountState === 'invalid'
                    ? 'invalid'
                    : action.payload.filteredCount,
              },
            },
          };
    }

    // finally, handle parameter specific actions
    default:
      return reduceParamState(state, action);
  }
}

function reduceParamState(state: QuestionState, action: Action) {
  if (
    'payload' in action &&
    action.payload != null &&
    typeof action.payload === 'object' &&
    'parameter' in action.payload
  ) {
    const { parameter } = action.payload;
    if (parameter) {
      const paramState = paramReducer(
        parameter,
        state.paramUIState[parameter.name],
        action
      );
      if (paramState !== state.paramUIState[parameter.name]) {
        return {
          ...state,
          paramUIState: {
            ...state.paramUIState,
            [parameter.name]: paramState,
          },
        };
      }
    }
  }

  return state;
}

/**
 * Add parametersByName and groupsByName objects
 */
function normalizeQuestion(question: QuestionWithParameters) {
  return {
    ...question,
    parametersByName: keyBy(question.parameters, 'name'),
    groupsByName: keyBy(question.groups, 'name'),
  };
}

// Observers
// ---------

type QuestionEpic = ModuleEpic<RootState, Action>;

const observeLoadQuestion: QuestionEpic = (
  action$,
  state$,
  { paramValueStore, wdkService }
) =>
  action$.pipe(
    filter(
      (action): action is UpdateActiveQuestionAction =>
        action.type === UPDATE_ACTIVE_QUESTION
    ),
    mergeMap((action) =>
      from(
        loadQuestion(
          paramValueStore,
          wdkService,
          action.payload.searchName,
          action.payload.autoRun,
          action.payload.prepopulateWithLastParamValues,
          action.payload.stepId,
          action.payload.initialParamData,
          action.payload.submissionMetadata
        )
      ).pipe(
        takeUntil(
          action$.pipe(
            filter(
              (killAction) =>
                killAction.type === UNLOAD_QUESTION &&
                killAction.payload.searchName === action.payload.searchName
            )
          )
        )
      )
    )
  );

const observeAutoRun: QuestionEpic = (action$, state$, { wdkService }) =>
  action$.pipe(
    filter(
      (action): action is QuestionLoadedAction =>
        action.type === QUESTION_LOADED && action.payload.autoRun
    ),
    map((action) =>
      submitQuestion({
        searchName: action.payload.searchName,
        autoRun: action.payload.autoRun,
        submissionMetadata: action.payload.submissionMetadata ?? {
          type: 'create-strategy',
        },
      })
    )
  );

const observeLoadQuestionSuccess: QuestionEpic = (action$) =>
  action$.pipe(
    ofType<Action, QuestionLoadedAction>(QUESTION_LOADED),
    mergeMap(
      ({
        payload: { question, searchName, paramValues, initialParamData },
      }: QuestionLoadedAction) =>
        from(
          question.parameters.map((parameter) =>
            initParam({ parameter, paramValues, searchName, initialParamData })
          )
        )
    )
  );

const observeStoreUpdatedParams: QuestionEpic = (
  action$,
  state$,
  { paramValueStore }
) =>
  action$.pipe(
    ofType<Action, UpdateParamValueAction>(UPDATE_PARAM_VALUE),
    mergeMap(async (action: UpdateParamValueAction) => {
      const searchName = action.payload.searchName;
      const questionState = state$.value.question.questions[searchName];

      if (questionState == null) {
        throw new Error(
          `Tried to record the parameter values of a nonexistent or unloaded question ${searchName}`
        );
      }

      const newParamValues = questionState.paramValues;

      await updateLastParamValues(paramValueStore, searchName, newParamValues);
      return EMPTY;
    }),
    mergeAll()
  );

type ActionAffectingGroupCount =
  | ChangeGroupVisibilityAction
  | UpdateParamValueAction;

const observeLoadGroupCount: QuestionEpic = (action$, state$, { wdkService }) =>
  action$.pipe(
    ofType<Action, ActionAffectingGroupCount>(
      CHANGE_GROUP_VISIBILITY,
      UPDATE_PARAM_VALUE
    ),
    debounceTime(1000),
    switchMap((action: ActionAffectingGroupCount) => {
      const { searchName } = action.payload;
      const questionState = state$.value.question.questions[searchName];

      if (questionState == null) {
        throw new Error(
          `Tried to load group count of a nonexistent or unloaded question ${searchName}`
        );
      }

      if (
        questionState.question.properties?.websiteProperties?.includes(
          'useWizard'
        ) != true
      ) {
        return EMPTY;
      }

      return from(
        [{ name: '__total__' }]
          .concat(questionState.question.groups)
          .filter(
            (group) =>
              questionState.groupUIState[group.name]?.filteredCountState ===
              'loading'
          )
      ).pipe(
        mergeMap((group) => {
          const groupNameToLoadCountFor = group.name;

          const groupsUntilHere = Seq.from(questionState.question.groups)
            .takeWhile((group) => group.name !== groupNameToLoadCountFor)
            .concat(Seq.of(group));

          const parameters =
            groupNameToLoadCountFor === '__total__'
              ? questionState.defaultParamValues
              : groupsUntilHere.reduce(
                  (paramValues: ParameterValues, group: ParameterGroup) => {
                    return group.parameters.reduce(
                      (paramValues: ParameterValues, paramName: string) => {
                        return Object.assign(paramValues, {
                          [paramName]: questionState.paramValues[paramName],
                        });
                      },
                      paramValues
                    );
                  },
                  Object.assign(
                    {},
                    questionState.defaultParamValues
                  ) as ParameterValues
                );

          const answerSpec = {
            searchName,
            searchConfig: {
              parameters,
            },
          };

          const formatConfig = {
            pagination: { offset: 0, numRecords: 0 },
          };

          return from(
            wdkService.getAnswerJson(answerSpec, formatConfig).then((answer) =>
              groupCountLoaded({
                searchName,
                groupName: groupNameToLoadCountFor,
                filteredCount: answer.meta.totalCount,
              })
            )
          );
        })
      );
    })
  );

const observeUpdateDependentParams: QuestionEpic = (
  action$,
  state$,
  { wdkService }
) =>
  action$.pipe(
    ofType<Action, UpdateParamValueAction>(UPDATE_PARAM_VALUE),
    filter((action) => action.payload.parameter.dependentParams.length > 0),
    debounceTime(1000),
    mergeMap((action: UpdateParamValueAction) => {
      const { searchName } = action.payload;
      const questionState = state$.value[key].questions[searchName];
      if (questionState == null) return EMPTY;

      const xs = questionState.question.parameters
        .filter(
          (parameter) =>
            questionState.paramsUpdatingDependencies[parameter.name]
        )
        .map((parameter) => ({
          searchName,
          parameter,
          paramValue: questionState.paramValues[parameter.name],
          paramValues: questionState.paramValues,
        }));
      return from(xs).pipe(
        concatMap((x) => {
          const { searchName, parameter, paramValue, paramValues } = x;
          return from(
            wdkService
              .getRefreshedDependentParams(
                searchName,
                parameter.name,
                paramValue,
                paramValues
              )
              .then(
                (refreshedDependentParameters) =>
                  updateDependentParams({
                    searchName,
                    updatedParameter: parameter,
                    refreshedDependentParameters,
                  }),
                (error) =>
                  paramError({
                    searchName,
                    error: error.message,
                    paramName: parameter.name,
                  })
              )
          ).pipe(
            takeUntil(
              action$.pipe(
                filter(
                  (killAction) =>
                    killAction.type === UNLOAD_QUESTION &&
                    killAction.payload.searchName === action.payload.searchName
                )
              )
            )
          );
        })
      );
    })
  );

const observeQuestionSubmit: QuestionEpic = (action$, state$, services) =>
  action$.pipe(
    filter(submitQuestion.isOfType),
    mergeMap((action) => {
      const questionState =
        state$.value[key].questions[action.payload.searchName];
      if (questionState == null) return EMPTY;
      return from(
        Promise.all(
          questionState.question.parameters.map((parameter) => {
            const ctx = {
              parameter,
              searchName: questionState.question.urlSegment,
              paramValues: questionState.paramValues,
            };
            return Promise.resolve(
              getValueFromState(ctx, questionState, services)
            ).then((value) => [parameter, value] as [Parameter, string]);
          })
        )
          .then((entries) => {
            return entries.reduce(
              (paramValues, [parameter, value]) =>
                Object.assign(paramValues, { [parameter.name]: value }),
              {} as ParameterValues
            );
          })
          .then((paramValues): Observable<Action> => {
            const {
              payload: { submissionMetadata },
            }: SubmitQuestionAction = action;
            const { question } = questionState;

            // Parse the input string into a number
            const weight = Number.parseInt(questionState.weight || '');
            const customName =
              questionState.customName ||
              questionState.question.shortDisplayName;
            const searchName = question.urlSegment;
            const searchConfig = {
              parameters: paramValues,
              wdkWeight: Number.isNaN(weight) ? DEFAULT_STEP_WEIGHT : weight,
            };

            updateLastParamValues(
              services.paramValueStore,
              searchName,
              paramValues
            );

            if (submissionMetadata.type === 'edit-step') {
              return of(
                requestReviseStep(
                  submissionMetadata.strategyId,
                  submissionMetadata.stepId,
                  {
                    customName,
                  },
                  {
                    ...submissionMetadata.previousSearchConfig,
                    ...searchConfig,
                  }
                )
              );
            }

            const newSearchStepSpec = {
              searchName,
              searchConfig,
              customName,
            };

            if (submissionMetadata.type === 'submit-custom-form') {
              submissionMetadata.onStepSubmitted(
                services.wdkService,
                newSearchStepSpec
              );
              return EMPTY;
            }

            if (submissionMetadata.type === 'create-strategy') {
              // if trying to initialize a web services tutorial
              if (submissionMetadata.webServicesTutorialSubmission) {
                const answerPromise = services.wdkService.getAnswerJson(
                  {
                    searchName,
                    searchConfig: { parameters: paramValues },
                  },
                  {
                    pagination: { offset: 0, numRecords: 1 },
                  }
                );

                return from(
                  answerPromise.then(() => {
                    const weightQueryParam = Number.isNaN(weight)
                      ? DEFAULT_STEP_WEIGHT
                      : weight;
                    const queryString =
                      'searchName=' +
                      searchName +
                      '&weight=' +
                      weightQueryParam +
                      Object.keys(paramValues)
                        .map(
                          (paramName) =>
                            '&' +
                            paramName +
                            '=' +
                            encodeURIComponent(paramValues[paramName])
                        )
                        .join('');

                    return transitionToInternalPage(
                      '/web-services-help?' + queryString
                    );
                  })
                );
              }

              // if noSummaryOnSingleRecord is true, do special logic
              return from(
                Promise.resolve(questionState.question.noSummaryOnSingleRecord)
                  .then((noSummaryOnSingleRecord) => {
                    if (noSummaryOnSingleRecord) {
                      const answerPromise = services.wdkService.getAnswerJson(
                        {
                          searchName: questionState.question.urlSegment,
                          searchConfig: { parameters: paramValues },
                        },
                        {
                          pagination: { offset: 0, numRecords: 1 },
                        }
                      );
                      return answerPromise.then((answer) => {
                        if (answer.meta.totalCount === 1) {
                          return answer.records[0];
                        }
                        return undefined;
                      });
                    }
                    return undefined;
                  })
                  .then((singleRecord): Action | Promise<Action> => {
                    if (singleRecord != null) {
                      const { question } = questionState;
                      return transitionToInternalPage(
                        `/record/${
                          question.outputRecordClassName
                        }/${singleRecord.id.map((p) => p.value).join('/')}`
                      );
                    }
                    return services.wdkService
                      .createStep(newSearchStepSpec)
                      .then(({ id: newSearchStepId }) =>
                        requestCreateStrategy({
                          isSaved: false,
                          isPublic: false,
                          stepTree: {
                            stepId: newSearchStepId,
                          },
                          name:
                            submissionMetadata.strategyName ??
                            DEFAULT_STRATEGY_NAME,
                        })
                      );
                  })
              );
            }

            const strategyEntry =
              state$.value.strategies.strategies[submissionMetadata.strategyId];
            const strategy = strategyEntry && strategyEntry.strategy;

            if (!strategy) {
              throw new Error(
                `Tried to update a nonexistent or unloaded strategy ${submissionMetadata.strategyId}`
              );
            }

            if (submissionMetadata.type === 'add-binary-step') {
              const operatorQuestionState =
                state$.value[key].questions[
                  submissionMetadata.operatorSearchName
                ];

              if (
                !operatorQuestionState ||
                operatorQuestionState.questionStatus !== 'complete'
              ) {
                throw new Error(
                  `Tried to create an operator step using a nonexistent or unloaded question ${submissionMetadata.operatorSearchName}`
                );
              }

              const operatorParamValues =
                (operatorQuestionState && operatorQuestionState.paramValues) ||
                {};

              const newSearchStep =
                services.wdkService.createStep(newSearchStepSpec);
              const operatorStep = services.wdkService.createStep({
                searchName: submissionMetadata.operatorSearchName,
                searchConfig: {
                  parameters: operatorParamValues,
                },
                customName: operatorQuestionState.question.shortDisplayName,
              });

              return from(
                Promise.all([newSearchStep, operatorStep]).then(
                  ([{ id: newSearchStepId }, { id: binaryOperatorStepId }]) =>
                    requestPutStrategyStepTree(
                      submissionMetadata.strategyId,
                      addStep(
                        strategy.stepTree,
                        submissionMetadata.addType,
                        binaryOperatorStepId,
                        {
                          stepId: newSearchStepId,
                        }
                      )
                    )
                )
              );
            }

            return from(
              services.wdkService
                .createStep(newSearchStepSpec)
                .then(({ id: unaryOperatorStepId }) =>
                  requestPutStrategyStepTree(
                    submissionMetadata.strategyId,
                    addStep(
                      strategy.stepTree,
                      submissionMetadata.addType,
                      unaryOperatorStepId,
                      undefined
                    )
                  )
                )
            );
          })
      ).pipe(
        mergeAll(),
        catchError((error: any) =>
          of(
            reportSubmissionError(
              action.payload.searchName,
              error,
              services.wdkService
            )
          )
        )
      );
    })
  );

async function goToStrategyPage([
  submitQuestionAction,
  fulfillCreateStrategyAction,
]: [
  InferAction<typeof submitQuestion>,
  InferAction<typeof fulfillCreateStrategy>
]): Promise<InferAction<typeof transitionToInternalPage>> {
  const newStrategyId = fulfillCreateStrategyAction.payload.strategyId;
  return transitionToInternalPage(`/workspace/strategies/${newStrategyId}`, {
    replace: submitQuestionAction.payload.autoRun,
  });
}

export const observeQuestion: QuestionEpic = combineEpics(
  observeLoadQuestion,
  observeLoadQuestionSuccess,
  observeAutoRun,
  observeStoreUpdatedParams,
  observeUpdateDependentParams,
  observeLoadGroupCount,
  observeQuestionSubmit,
  mrate([submitQuestion, fulfillCreateStrategy], goToStrategyPage, {
    areActionsCoherent: ([submitAction]) =>
      (submitAction.payload.submissionMetadata.type === 'create-strategy' &&
        !submitAction.payload.submissionMetadata
          .webServicesTutorialSubmission) ||
      // FIXME: This is to handle the special case of creating a strategy
      // FIXME: with UnifiedBlast. We should remove the 'submit-custom-form'
      // FIXME: type of SubmissionMetadata ASAP.
      submitAction.payload.submissionMetadata.type === 'submit-custom-form',
    areActionsNew: (
      [, prevFulfillCreateStrategy],
      [, newFulfillCreateStrategy]
    ) =>
      prevFulfillCreateStrategy.payload.strategyId !==
      newFulfillCreateStrategy.payload.strategyId,
  })
);

// Helpers
// -------

async function loadQuestion(
  paramValueStore: ParamValueStore,
  wdkService: WdkService,
  searchName: string,
  autoRun: boolean,
  prepopulateWithLastParamValues: boolean,
  stepId?: number,
  initialParamData?: ParameterValues,
  submissionMetadata?: SubmissionMetadata
) {
  const step = stepId ? await wdkService.findStep(stepId) : undefined;
  const initialParams = await fetchInitialParams(
    searchName,
    step,
    initialParamData,
    prepopulateWithLastParamValues,
    paramValueStore
  );

  const atLeastOneInitialParamValueProvided =
    Object.keys(initialParams).length > 0;

  try {
    const defaultQuestion = await wdkService.getQuestionAndParameters(
      searchName
    );

    const question = atLeastOneInitialParamValueProvided
      ? await wdkService.getQuestionGivenParameters(searchName, initialParams)
      : defaultQuestion;

    const recordClass = await wdkService.findRecordClass(
      question.outputRecordClassName
    );

    const defaultParamValues = extractParamValues(
      defaultQuestion.parameters,
      {},
      step
    );
    const paramValues = extractParamValues(
      question.parameters,
      initialParams,
      step
    );

    const wdkWeight = step == null ? undefined : step.searchConfig.wdkWeight;

    await updateLastParamValues(paramValueStore, searchName, paramValues);

    return questionLoaded({
      autoRun,
      prepopulateWithLastParamValues,
      searchName,
      question,
      recordClass,
      paramValues,
      defaultParamValues,
      initialParamData, // Intentionally not initialParams to preserve previous behaviour ( an "INIT_PARAM" action triggered)
      wdkWeight,
      customName: step?.customName,
      stepValidation: step?.validation,
      submissionMetadata,
    });
  } catch (error) {
    return error.status === 404
      ? questionNotFound({ searchName })
      : questionError({ searchName });
  }
}

async function fetchInitialParams(
  searchName: string,
  step: Step | undefined,
  initialParamData: ParameterValues | undefined,
  prepopulateWithLastParamValues: boolean,
  paramValueStore: ParamValueStore
) {
  if (step != null) {
    return initialParamDataFromStep(step);
  } else if (initialParamData != null) {
    return initialParamDataWithDatasetParamSpecialCase(initialParamData);
  } else if (prepopulateWithLastParamValues) {
    return (await fetchLastParamValues(paramValueStore, searchName)) ?? {};
  } else {
    return {};
  }
}

function initialParamDataFromStep(step: Step): ParameterValues {
  const {
    searchConfig: { parameters },
    validation,
  } = step;
  const keyedErrors = validation.isValid == true ? {} : validation.errors.byKey;
  return Object.keys(parameters).reduce(function (values, k) {
    return k in keyedErrors
      ? values
      : Object.assign(values, { [k]: parameters[k] });
  }, {});
}

function initialParamDataWithDatasetParamSpecialCase(
  initialParamData: ParameterValues
) {
  return Object.keys(initialParamData).reduce(function (result, paramName) {
    if (paramName.endsWith('.idList') || paramName.endsWith('.url')) {
      return result;
    }

    return Object.assign(result, {
      [paramName]: initialParamData[paramName],
    });
  }, {});
}

function updateLastParamValues(
  paramValueStore: ParamValueStore,
  searchName: string,
  newParamValues: ParameterValues
) {
  const paramValueStoreContext = makeParamValueStoreContext(searchName);

  return paramValueStore.updateParamValues(
    paramValueStoreContext,
    newParamValues
  );
}

function fetchLastParamValues(
  paramValueStore: ParamValueStore,
  searchName: string
) {
  const paramValueStoreContext = makeParamValueStoreContext(searchName);

  return paramValueStore.fetchParamValues(paramValueStoreContext);
}

function makeParamValueStoreContext(searchName: string) {
  return `question-form/${searchName}`;
}
