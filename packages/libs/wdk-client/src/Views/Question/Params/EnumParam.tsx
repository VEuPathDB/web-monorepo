import React from 'react';

import { Action, isOneOf } from '../../../Utils/ActionCreatorUtils';
import { EnumParam, Parameter } from '../../../Utils/WdkModel';
import { ParamInitAction } from '../QuestionActionCreators';

import * as List from './EnumParam/ListEnumParam';
import * as TreeBox from './EnumParam/TreeBoxEnumParam';
import { Context, createParamModule, isPropsType, Props } from './Utils';

type State = TreeBox.State;

const isEnumParamAction = isOneOf(
  ParamInitAction,
  TreeBox.ExpandedListSet,
  TreeBox.SearchTermSet
);

export default createParamModule({
  isType,
  isParamValueValid,
  reduce,
  Component
});

function isParamValueValid(context: Context<EnumParam>, state: State) {
  // TODO Delegate to List and TreeBox params (since counting logic varies)
  return true
}

function reduce(state: State, action: Action): State {
  if (!isEnumParamAction(action)) return state;
  const { parameter } = action.payload;
  if (parameter == null || !isType(parameter)) return state;
  if (TreeBox.isType(parameter)) {
    return TreeBox.reduce(state, action);
  }
  return state;
}

// Use this for both EnumParam and FlatVocabParam.
function isType(parameter: Parameter): parameter is EnumParam {
  return (
    parameter.type === 'EnumParam' ||
    parameter.type === 'FlatVocabParam'
  );
}

// TODO Handle various displayTypes (see WDK/Model/lib/rng/wdkModel.rng).
function Component(props: Props<EnumParam, any>) {
  if (isPropsType(props, TreeBox.isType)) {
    return (
      <TreeBox.TreeBoxEnumParam {...props} />
    );
  }

  else if (isPropsType(props, List.isType)) {
    return (
      <List.ListEnumParam {...props} />
    )
  }

  else {
    return (
      <div>Unknown enum param type: {props.parameter.displayType}</div>
    )
  }
}
