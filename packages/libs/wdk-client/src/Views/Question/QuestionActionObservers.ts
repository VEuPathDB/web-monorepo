import { Epic, combineEpics } from 'redux-observable';
import { from, EMPTY } from 'rxjs';
import { mergeMap, takeUntil, debounceTime, filter } from 'rxjs/operators';
import { EpicDependencies } from '../../Core/Store';
import { Action } from '../../Utils/ActionCreatorUtils';
import { Parameter, ParameterValues } from '../../Utils/WdkModel';
import WdkService from '../../Utils/WdkService';
import { getValueFromState } from './Params';
import {
  ActiveQuestionUpdatedAction,
  UnloadQuestionAction,
  QuestionLoadedAction,
  QuestionSubmitted,
  QuestionNotFoundAction,
  QuestionErrorAction,
  ParamInitAction,
  ParamValueUpdatedAction,
  ParamsUpdatedAction,
  ParamErrorAction
} from "./QuestionActionCreators";
import { State } from './QuestionStoreModule';

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

const observeQuestionSubmit: QuestionEpic = (action$, state$, services) => action$.pipe(
  filter(QuestionSubmitted.test),
  mergeMap(action => {
    const questionState = state$.value.questions[action.payload.questionName];
    if (questionState == null) return EMPTY;
    Promise.all(questionState.question.parameters.map(parameter => {
      const ctx = { parameter, questionName: questionState.question.urlSegment, paramValues: questionState.paramValues };
      return Promise.resolve(getValueFromState(ctx, questionState, services)).then(value => [ parameter, value ] as [ Parameter, string ])
    })).then(entries => {
      return entries.reduce((paramValues, [ parameter, value ]) => Object.assign(paramValues, { [parameter.name]: value }), {} as ParameterValues);
    }).then(paramValues => {
      console.log('TODO: Submit question', paramValues);
    })

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