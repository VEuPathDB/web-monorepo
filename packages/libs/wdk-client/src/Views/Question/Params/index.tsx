import * as React from 'react';
import { merge } from 'rxjs';

import { combineObserve } from '../../../Utils/ActionCreatorUtils';
import { Parameter } from '../../../Utils/WdkModel';

import { Context, isPropsType, ParamModule, Props } from './Utils';

import CheckboxEnumParamModule from './CheckboxEnumParam';
import DatasetParamModule from './DatasetParam';
import DateParamModule from './DateParam';
import DateRangeParamModule from './DateRangeParam';
import FilterParamNewModule from './FilterParamNew';
import NumberParamModule from './NumberParam';
import NumberRangeParamModule from './NumberRangeParam';
import SelectEnumParamModule from './SelectEnumParam';
import StringParamModule from './StringParam';
import TreeBoxEnumParamModule from './TreeBoxEnumParam';
import TypeAheadEnumParamModule from './TypeAheadEnumParam';
import { mergePluginsByType } from '../../../Utils/ClientPlugin';
import { combineEpics } from 'redux-observable';

// Param modules
// -------------
const paramModules: ParamModule[] = [
  CheckboxEnumParamModule as ParamModule,
  DatasetParamModule as ParamModule,
  DateParamModule as ParamModule,
  DateRangeParamModule as ParamModule,
  FilterParamNewModule as ParamModule,
  NumberParamModule as ParamModule,
  NumberRangeParamModule as ParamModule,
  SelectEnumParamModule as ParamModule,
  StringParamModule as ParamModule,
  TreeBoxEnumParamModule as ParamModule,
  TypeAheadEnumParamModule as ParamModule,
];

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

export const observeParam =
  combineEpics(...(paramModules.map(m => m.observeParam)));

export const observeSubmit: ParamModule['observeSubmit'] = (...args) =>
  merge(...paramModules.map(m => m.observeSubmit(...args)));
    

export function isParamValueValid(context: Context<Parameter>, state: any) {
  for (let paramModule of paramModules) {
    if (paramModule.isType(context.parameter)) {
      return paramModule.isParamValueValid(context, state);
    }
  }
  return true;
}
