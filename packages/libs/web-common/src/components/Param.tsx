import React from 'react';
import { Dispatch } from 'redux';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import {
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WizardState, ParameterEventHandlers } from '../util/WizardTypes';

const uiConfig = { hideGlobalCounts: true };

export interface Props {
  dispatch: Dispatch;
  param: Parameter;
  paramValues: ParameterValues;
  uiState: WizardState['paramUIState'][string];
  eventHandlers: ParameterEventHandlers;
  searchName: string;
  recordClassName: string;
}

export default function Param(props: Props) {
  const {
    dispatch,
    param: parameter,
    paramValues,
    uiState,
    eventHandlers,
    searchName,
    recordClassName,
  } = props;
  const value = paramValues[parameter.name];
  return (
    <Plugin
      context={{
        type: 'questionFormParameter',
        name: parameter.name,
        searchName,
        recordClassName,
      }}
      pluginProps={{
        ctx: {
          searchName,
          parameter,
          paramValues,
        },
        parameter,
        value,
        uiConfig,
        uiState,
        onParamValueChange: (paramValue: string) => {
          eventHandlers.onParamValueChange(parameter, paramValue);
        },
        dispatch: dispatch,
      }}
    />
  );
}
