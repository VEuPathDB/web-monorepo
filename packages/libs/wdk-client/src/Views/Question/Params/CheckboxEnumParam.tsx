import React from 'react';
import CheckboxList from '../../../Components/InputControls/CheckboxList';
import RadioList from '../../../Components/InputControls/RadioList';
import { CheckboxEnumParam, Parameter } from '../../../Utils/WdkModel';
import { Context, Props, createParamModule } from './Utils';
import { isEnumParam, valueToArray } from './EnumParamUtils';

export default createParamModule({
  isType,
  isParamValueValid,
  Component: CheckboxEnumParam
});

function isType(parameter: Parameter): parameter is CheckboxEnumParam {
  return isEnumParam(parameter) && parameter.displayType === 'checkBox';
}

function isParamValueValid() {
  return true;
}

function CheckboxEnumParam(props: Props<CheckboxEnumParam>) {
  const { ctx, onParamValueChange, parameter, value } = props;

  return parameter.multiPick
    ? <CheckboxList
        items={parameter.vocabulary.map(([value, display]) => ({ value, display }))}
        value={valueToArray(value)}
        onChange={value => onParamValueChange(value.join(','))}
      />
    : <RadioList
        items={parameter.vocabulary.map(([value, display]) => ({ value, display }))}
        value={value}
        onChange={onParamValueChange}
      />
}

