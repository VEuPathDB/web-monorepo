import * as React from 'react';

import { Parameter } from '../../../Utils/WdkModel';

import {
  Context,
  isPropsType,
  ParamModule,
  Props,
} from '../../../Views/Question/Params/Utils';

import EnumParamModule from '../../../Views/Question/Params/EnumParam';
import DatasetParamModule from '../../../Views/Question/Params/DatasetParam';
import DateParamModule from '../../../Views/Question/Params/DateParam';
import DateRangeParamModule from '../../../Views/Question/Params/DateRangeParam';
import FilterParamNewModule from '../../../Views/Question/Params/FilterParamNew';
import NumberParamModule from '../../../Views/Question/Params/NumberParam';
import NumberRangeParamModule from '../../../Views/Question/Params/NumberRangeParam';
import StringParamModule from '../../../Views/Question/Params/StringParam';
import { combineEpics } from 'redux-observable';

// Param modules
// -------------
export const paramModules: ParamModule[] = [
  EnumParamModule as ParamModule,
  DatasetParamModule as ParamModule,
  DateParamModule as ParamModule,
  DateRangeParamModule as ParamModule,
  FilterParamNewModule as ParamModule,
  NumberParamModule as ParamModule,
  NumberRangeParamModule as ParamModule,
  StringParamModule as ParamModule,
];

// API used by Question{ActionCreators,Controller,Store}
// -----------------------------------------------------

/**
 * Parameter renderer.
 */
export function ParamComponent<T extends Parameter, S>(props: Props<T, S>) {
  for (let paramModule of paramModules) {
    if (isPropsType(props, paramModule.isType)) {
      return <paramModule.Component {...props} />;
    }
  }
  return (
    <div>
      <em style={{ color: 'red' }}>
        Unknown parameter type {props.parameter.type}{' '}
      </em>
      <input type="text" value={props.value} readOnly />
    </div>
  );
}

/**
 * Parameter state-action reducer.
 */
export function reduce<T extends Parameter>(
  parameter: T,
  state: any,
  action: any
): any {
  for (let paramModule of paramModules) {
    if (paramModule.isType(parameter) && paramModule.reduce) {
      return paramModule.reduce(state, action);
    }
  }
  return state;
}

export const observeParam = combineEpics(
  ...paramModules.map((m) => m.observeParam)
);

export const getValueFromState: ParamModule['getValueFromState'] = (
  context,
  state,
  services
) => {
  for (let paramModule of paramModules) {
    if (paramModule.isType(context.parameter)) {
      return paramModule.getValueFromState(context, state, services);
    }
  }
  return state.paramValues[context.parameter.name];
};

export function isParamValueValid(context: Context<Parameter>, state: any) {
  for (let paramModule of paramModules) {
    if (paramModule.isType(context.parameter)) {
      return paramModule.isParamValueValid(context, state);
    }
  }
  return true;
}
