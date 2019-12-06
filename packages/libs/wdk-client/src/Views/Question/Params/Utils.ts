import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import React, { useCallback } from 'react';
import { EMPTY } from 'rxjs';
import { Action } from 'wdk-client/Actions';
import { Parameter, ParameterValues } from 'wdk-client/Utils/WdkModel';
import { Epic } from 'redux-observable';
import { State, QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { Props as FormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';

// Types
// -----

// FIXME Add full question, paramUIState and groupUIState
// OR TODO: change parameter to parameterName to reduce type constraints
export type Context<T extends Parameter> = {
  searchName: string;
  parameter: T;
  paramValues: ParameterValues;
}

export type Props<T extends Parameter, S = void> = {
  ctx: Context<T>;
  parameter: T;
  value: string;
  uiState: S;
  dispatch: DispatchAction;
  onParamValueChange: (value: string) => void;

}

export type ParamModule<T extends Parameter = Parameter, S = any> = {
  isType: (parameter: Parameter) => parameter is T;
  /**
   * Determine if the param value is valid. This can be used by form container
   * to determine if submit should be disabled. The Component is responsible
   * for providing details about the invalid state.
   */
  isParamValueValid: (context: Context<T>, state: S) => boolean;
  reduce: (state: S, action: Action) => S;
  Component: React.ComponentType<Props<T, S>>;
  observeParam: Epic<Action, Action, State, EpicDependencies>;
  /**
   * React to submit events. The Question will not be submitted until this is complete.
   */
  getValueFromState: (context: Context<T>, state: QuestionState, services: EpicDependencies) => string | Promise<string>;
}

type ParamModuleSpec<T extends Parameter, S> =
  Partial<ParamModule<T, S>> & Pick<ParamModule<T, S>, 'isParamValueValid' | 'Component' | 'isType'>

export function createParamModule<T extends Parameter, S>(spec: ParamModuleSpec<T, S>): ParamModule<T, S> {
  return {
    ...spec,
    reduce: spec.reduce || defaultReduce,
    observeParam: spec.observeParam || defaultObserve,
    getValueFromState: spec.getValueFromState || defaultGetValueFromState
  }
}

function defaultReduce<S>(state: S, action: Action): S {
  return state;
}

function defaultObserve() {
  return EMPTY;
}

function defaultGetValueFromState(context: Context<Parameter>) {
  return context.paramValues[context.parameter.name];
}


// Type guards (see https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
// -----------------------------------------------------------------------------------------------------------

export function isPropsType<T extends Parameter>(
  props: Props<Parameter, any>,
  predicate: (parameter: Parameter) => parameter is T
): props is Props<T, any> {
  return predicate(props.parameter);
}

export function isContextType<T extends Parameter>(
  context: Context<Parameter>,
  predicate: (parameter: Parameter) => parameter is T
): context is Context<T> {
  return predicate(context.parameter);
}

// Hook for making custom parameter-updating callbacks
export const useChangeParamValue = (parameter: Parameter, state: QuestionState, updateParamValue: FormProps['eventHandlers']['updateParamValue']) => {
  const searchName = state.question.urlSegment;
  const paramValues = state.paramValues;

  const changeParamValue = useCallback((paramValue: string) => {
    updateParamValue({
      searchName,
      parameter,
      paramValues,
      paramValue
    });
  }, [ updateParamValue, searchName, parameter, paramValues ]);

  return changeParamValue;
};
