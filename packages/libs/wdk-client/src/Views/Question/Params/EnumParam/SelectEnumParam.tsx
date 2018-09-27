import React from 'react';
import { Seq } from '../../../../Utils/IterableUtils';
import { SelectEnumParam, Parameter } from '../../../../Utils/WdkModel';
import { Context, Props, createParamModule } from '../Utils';
import { valueToArray, isEnumParam } from './Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  Component: SelectEnumParam
});

function isParamValueValid(context: Context<SelectEnumParam>) {
  return typeof context.paramValues[context.parameter.name] === 'string';
}

function isType(parameter: Parameter): parameter is SelectEnumParam {
  return isEnumParam(parameter) && parameter.displayType === 'select';
}

// FIXME Handle better multi vs single
function SelectEnumParam(props: Props<SelectEnumParam>) {
  const valueArray = valueToArray(props.value);
  return (
    <select
      multiple={props.parameter.multiPick}
      value={props.parameter.multiPick ? valueArray : props.value}
      onChange={event => {
        const nextValue = Seq.from(event.target.querySelectorAll('option'))
          .filter(option => option.selected)
          .map(option => option.value)
          .join(',');
        props.onParamValueChange(nextValue);
      }}
    >
      {props.parameter.vocabulary.map(entry => (
        <option key={entry[0]} value={entry[0]}>{entry[1]}</option>
      ))}
    </select>
  );
}
