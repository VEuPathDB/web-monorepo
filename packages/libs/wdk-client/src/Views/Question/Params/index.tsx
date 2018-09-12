import * as React from 'react';

import { ActionObserver, combineObserve, Action } from '../../../Utils/ActionCreatorUtils';
import { Parameter } from '../../../Utils/WdkModel';

import EnumParamModule from './EnumParam';
import FilterParamNewModule from './FilterParamNew';
import NumberParamModule from './NumberParam';
import NumberRangeParamModule from './NumberRangeParam';
import { Context, isPropsType, ParamModule, Props } from './Utils';
import { empty } from 'rxjs';
import { combineEpics, Epic } from 'redux-observable';
import { State } from '../QuestionStoreModule';

// Param modules
// -------------
const paramModules = [
  EnumParamModule,
  FilterParamNewModule,
  NumberParamModule,
  NumberRangeParamModule
] as ParamModule<Parameter, any>[];


// API used by Question{ActionCreators,Controller,Store}
// -----------------------------------------------------

/**
 * Parameter renderer.
 */
export function ParamComponent<T extends Parameter>(props: Props<T, any>) {
  for (let paramModule of paramModules) {
    if (isPropsType(props, paramModule.isType)) {
      return <paramModule.Component {...props} />
    }
  }
  return (
    <div>
      <em style={{color: 'red'}}>Unknown parameter type {props.parameter.type} </em>
      <input type="text" value={props.value} readOnly />
    </div>
  );
}

/**
 * Parameter state-action reducer.
 */
export function reduce<T extends Parameter>(parameter: T, state: any, action: any): any {
  for (let paramModule of paramModules) {
    if (paramModule.isType(parameter) && paramModule.reduce) {
      return paramModule.reduce(state, action);
    }
  }
  return state;
}

export const observeParam = combineEpics<Epic<Action, Action, State>>(...(paramModules.map(m => m.observeParam || empty)))

export function isParamValueValid(context: Context<Parameter>, state: any) {
  for (let paramModule of paramModules) {
    if (paramModule.isType(context.parameter)) {
      return paramModule.isParamValueValid(context, state);
    }
  }
  return true;
}