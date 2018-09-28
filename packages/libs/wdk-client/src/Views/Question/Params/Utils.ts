import { DispatchAction } from '../../../Core/CommonTypes';
import { QuestionStore } from '../../../Core/State/Stores';
import React from 'react';
import { EMPTY, Observable } from 'rxjs';
import { Action, ActionObserver, ObserveServices } from '../../../Utils/ActionCreatorUtils';
import { Parameter, ParameterValues } from '../../../Utils/WdkModel';


// Types
// -----

// FIXME Add full question, paramUIState and groupUIState
export type Context<T extends Parameter> = {
  questionName: string;
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

type ParamModuleSpec<T extends Parameter, S> = {
  isType: (parameter: Parameter) => parameter is T;
  isParamValueValid: (context: Context<T>, state: S) => boolean;
  reduce?: (state: S, action: any) => S;
  Component: React.ComponentType<Props<T, S>>;
  observeParam?: ActionObserver<QuestionStore>;
}

export type ParamModule<T extends Parameter = Parameter, S = any> = {
  isType: (parameter: Parameter) => parameter is T;
  /**
   * Determine if the param value is valid. This can be used by form container
   * to determine if submit should be disabled. The Component is repsonsible
   * for providing details about the invalid state.
   */
  isParamValueValid: (context: Context<T>, state: S) => boolean;
  reduce: (state: S, action: Action) => S;
  Component: React.ComponentType<Props<T, S>>;
  observeParam: ActionObserver<QuestionStore>;
}

export function createParamModule<T extends Parameter, S>(spec: ParamModuleSpec<T, S>): ParamModule<T, S> {
  return {
    ...spec,
    reduce: spec.reduce || defaultReduce,
    observeParam: spec.observeParam || defaultObserve
  }
}

function defaultReduce<S>(state: S, action: Action): S {
  return state;
}

function defaultObserve(action$: Observable<Action>, services: ObserveServices) {
  return EMPTY;
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
