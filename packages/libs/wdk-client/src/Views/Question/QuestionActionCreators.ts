import { Epic, combineEpics, ActionsObservable } from 'redux-observable';
import { debounceTime, filter, mergeMap, takeUntil } from 'rxjs/operators';
import { from, concat, of, EMPTY } from 'rxjs';

import { Action, makeActionCreator } from '../../Utils/ActionCreatorUtils';
import { Parameter, ParameterValue, ParameterValues, QuestionWithParameters, RecordClass } from '../../Utils/WdkModel';
import WdkService from '../../Utils/WdkService';
import { State } from '../../Views/Question/QuestionStoreModule';
import { EpicDependencies } from '../../Core/Store';
// import { observeSubmit } from './Params';

type BasePayload = { questionName: string; }

export const ActiveQuestionUpdatedAction = makeActionCreator<
  BasePayload & {
    paramValues?: ParameterValues;
    stepId: number | undefined;
  },
  'quesiton/active-question-updated'
>('quesiton/active-question-updated');

export const QuestionLoadedAction = makeActionCreator<
  BasePayload & {
    question: QuestionWithParameters;
    recordClass: RecordClass;
    paramValues: ParameterValues;
  },
  'question/question-loaded'
>('question/question-loaded');

export const UnloadQuestionAction = makeActionCreator<BasePayload, 'question/unload-question'>('question/unload-question');

export const QuestionErrorAction = makeActionCreator<BasePayload, 'question/question-error'>('question/question-error');

export const QuestionNotFoundAction = makeActionCreator<BasePayload, 'question/question-not-found'>('question/question-not-found');

export const QuestionSubmitRequested = makeActionCreator<BasePayload, 'question/question-submit-requested'>('question/question-submit-requested');

export const QuestionSubmitted =
  makeActionCreator<BasePayload, 'question/question-submitted'>('question/question-submitted');

export const ParamValueUpdatedAction =
  makeActionCreator<BasePayload & { parameter: Parameter, paramValues: ParameterValues, paramValue: ParameterValue }, 'question/param-value-update'>('question/param-value-update');

export const ParamErrorAction =
  makeActionCreator<BasePayload & { error: string, paramName: string }, 'question/param-error'>('question/param-error');

export const ParamsUpdatedAction =
  makeActionCreator<BasePayload & { parameters: Parameter[] }, 'question/params-updated' >('question/params-updated');

export const ParamInitAction =
  makeActionCreator<BasePayload & { parameter: Parameter; paramValues: ParameterValues }, 'question/param-init'>('question/param-init');

export const ParamStateUpdatedAction =
  makeActionCreator<BasePayload & { paramName: string; paramState: any }, 'question/param-state-updated'>('question/param-state-updated');

export const GroupVisibilityChangedAction =
  makeActionCreator<BasePayload & { groupName: string; isVisible: boolean; }, 'question/group-visibility-change'>('question/group-visibility-change');

export const GroupStateUpdatedAction =
  makeActionCreator<BasePayload & { groupName: string; groupState: any; }, 'question/group-state-update'>('question/group-state-update');


// Observers
// ---------

type QuestionEpic = Epic<Action, Action, State, EpicDependencies>;

const observeLoadQuestion: QuestionEpic = (action$, state$, { wdkService }) => action$.pipe(
  filter(ActiveQuestionUpdatedAction.test),
  mergeMap(action =>
    from(loadQuestion(wdkService, action.payload.questionName, action.payload.paramValues)).pipe(
    takeUntil(action$.pipe(filter(killAction => (
      UnloadQuestionAction.test(killAction) &&
      killAction.payload.questionName === action.payload.questionName
    )))))
  )
);

const observeLoadQuestionSuccess: QuestionEpic = (action$) => action$.pipe(
  filter(QuestionLoadedAction.test),
  mergeMap(({ payload: { question, questionName, paramValues }}) =>
    from(question.parameters.map(parameter =>
      ParamInitAction.create({ parameter, paramValues, questionName }))))
);

const observeUpdateDependentParams: QuestionEpic = (action$, state$, { wdkService }) => action$.pipe(
    filter(ParamValueUpdatedAction.test),
    filter(action => action.payload.parameter.dependentParams.length > 0),
    debounceTime(1000),
    mergeMap(action => {
      const { questionName, parameter, paramValues, paramValue } = action.payload;
      return from(wdkService.getQuestionParamValues(
        questionName,
        parameter.name,
        paramValue,
        paramValues
      ).then(
        parameters => ParamsUpdatedAction.create({questionName, parameters}),
        error => ParamErrorAction.create({ questionName, error: error.message, paramName: parameter.name })
      )).pipe(
        takeUntil(action$.pipe(filter(ParamValueUpdatedAction.test))),
        takeUntil(action$.pipe(filter(killAction => (
          UnloadQuestionAction.test(killAction) &&
          killAction.payload.questionName === action.payload.questionName
        ))))
      )
    })
  );

// FIXME This is not a workable solution!
// const observeQuestionSubmitRequest: QuestionEpic = (action$, state$, services) => action$.pipe(
//   filter(QuestionSubmitRequested.test),
//   mergeMap(action => concat(
//     observeSubmit(of(action) as ActionsObservable<Action>, state$, services),
//     of(QuestionSubmitted.create({ questionName: action.payload.questionName }))
//   ))
// );

const observeQuestionSubmit: QuestionEpic = (action$, state$) => action$.pipe(
  filter(QuestionSubmitted.test),
  mergeMap(() => {
    console.log('TODO: Submit question', state$.value);
    return EMPTY;
  })
)


export const observeQuestion: QuestionEpic = combineEpics(
  observeLoadQuestion,
  observeLoadQuestionSuccess,
  observeUpdateDependentParams,
  // observeQuestionSubmitRequest,
  observeQuestionSubmit
);

// Helpers
// -------

function loadQuestion(wdkService: WdkService, questionName: string, paramValues?: ParameterValues) {
  const question$ = paramValues == null
    ? wdkService.getQuestionAndParameters(questionName)
    : wdkService.getQuestionGivenParameters(questionName, paramValues);

  const recordClass$ = question$.then(question =>
    wdkService.findRecordClass(rc => rc.name == question.recordClassName));

  return Promise.all([question$, recordClass$]).then(
    ([question, recordClass]) => {
      if (paramValues == null) {
        paramValues = makeDefaultParamValues(question.parameters);
      }
      return QuestionLoadedAction.create({ questionName, question, recordClass, paramValues })
    },
    error => error.status === 404
      ? QuestionNotFoundAction.create({ questionName })
      : QuestionErrorAction.create({ questionName })
  );
}

function makeDefaultParamValues(parameters: Parameter[]) {
  return parameters.reduce(function(values, { name, defaultValue = ''}) {
    return Object.assign(values, { [name]: defaultValue });
  }, {} as ParameterValues);
}
