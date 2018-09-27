import * as React from 'react';

import { ActionObserver, combineObserve } from '../../../Utils/ActionCreatorUtils';
import { Parameter } from '../../../Utils/WdkModel';

import { Context, isPropsType, ParamModule, Props } from './Utils';

import CheckboxEnumParamModule from './EnumParam/CheckboxEnumParam';
import DateParamModule from './DateParam';
import DateRangeParamModule from './DateRangeParam';
import FilterParamNewModule from './FilterParamNew';
import NumberParamModule from './NumberParam';
import NumberRangeParamModule from './NumberRangeParam';
import SelectEnumParamModule from './EnumParam/SelectEnumParam';
import StringParamModule from './StringParam';
import TreeBoxEnumParamModule from './EnumParam/TreeBoxEnumParam';
import TypeAheadEnumParamModule from './EnumParam/TypeAheadEnumParam';

// Param modules
// -------------
const paramModules = [
  CheckboxEnumParamModule,
  DateParamModule,
  DateRangeParamModule,
  FilterParamNewModule,
  NumberParamModule,
  NumberRangeParamModule,
  SelectEnumParamModule,
  StringParamModule,
  TreeBoxEnumParamModule,
  TypeAheadEnumParamModule,
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

export const observeParam = combineObserve(
  ...(paramModules
    .map(m => m.observeParam)
    .filter(e => e != null) as ActionObserver[]))

export function isParamValueValid(context: Context<Parameter>, state: any) {
  for (let paramModule of paramModules) {
    if (paramModule.isType(context.parameter)) {
      return paramModule.isParamValueValid(context, state);
    }
  }
  return true;
}
