import { debounceTime, filter, mergeMap, takeUntil } from 'rxjs/operators';
import { from, Observable } from 'rxjs';

import { Action, combineObserve, ObserveServices, makeActionCreator, ActionObserver } from '../../Utils/ActionCreatorUtils';
import { Parameter, ParameterValue, ParameterValues, QuestionWithParameters, RecordClass } from '../../Utils/WdkModel';
import WdkService from '../../Utils/WdkService';
import QuestionStore from '../../Views/Question/QuestionStore';

type BasePayload = {
  questionName: string;
}

export const ActiveQuestionUpdatedAction = makeActionCreator<BasePayload & {
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

export const ParamValueUpdatedAction = makeActionCreator<BasePayload & {
  parameter: Parameter,
  dependentParameters: Parameter[],
  paramValues: ParameterValues,
  paramValue: ParameterValue
}, 'question/param-value-update'>('question/param-value-update');

export const ParamErrorAction = makeActionCreator<BasePayload & {
  error: string,
  paramName: string
}, 'question/param-error'>('question/param-error');

export const ParamsUpdatedAction = makeActionCreator<BasePayload & {
  parameters: Parameter[]
},
  'question/params-updated'
  >('question/params-updated');

export const ParamInitAction = makeActionCreator<BasePayload & {
  parameter: Parameter;
  paramValues: ParameterValues
}, 'question/param-init'>('question/param-init');

export const ParamStateUpdatedAction = makeActionCreator<BasePayload & {
  paramName: string;
  paramState: any
}, 'question/param-state-updated'>('question/param-state-updated');

export const GroupVisibilityChangedAction = makeActionCreator<BasePayload & {
  groupName: string;
  isVisible: boolean;
}, 'question/group-visibility-change'>('question/group-visibility-change');

export const GroupStateUpdatedAction = makeActionCreator<BasePayload & {
  groupName: string;
  groupState: any;
}, 'question/group-state-update'>('question/group-state-update');


// Observers
// ---------

export const observeQuestion: ActionObserver<QuestionStore> = combineObserve(observeLoadQuestion, observeUpdateDependentParams);

function observeLoadQuestion(action$: Observable<Action>, { wdkService }: ObserveServices<QuestionStore>): Observable<Action> {
  return action$.pipe(
    filter(ActiveQuestionUpdatedAction.test),
    mergeMap(action =>
      from(loadQuestion(wdkService, action.payload.questionName, action.payload.paramValues)).pipe(
      takeUntil(action$.pipe(filter(killAction => (
        UnloadQuestionAction.test(killAction) &&
        killAction.payload.questionName === action.payload.questionName
      )))))
    )
  )
}

function observeUpdateDependentParams(action$: Observable<Action>, {wdkService}: ObserveServices<QuestionStore>): Observable<Action> {
  return action$.pipe(
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
}


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
