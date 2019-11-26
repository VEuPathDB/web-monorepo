import React from 'react';
import MultiSelect from 'wdk-client/Components/InputControls/MultiSelect';
import SingleSelect from 'wdk-client/Components/InputControls/SingleSelect';
import { SelectEnumParam, Parameter } from 'wdk-client/Utils/WdkModel';
import { Context, Props, createParamModule } from 'wdk-client/Views/Question/Params/Utils';
import { valueToArray, isEnumParam } from 'wdk-client/Views/Question/Params/EnumParamUtils';

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
  const { onParamValueChange, parameter, value} = props;
  return parameter.multiPick
    ? <MultiSelect
        items={parameter.vocabulary.map(([value, display]) => ({ value, display }))}
        value={JSON.parse(value)}
        onChange={(value: string[]) => onParamValueChange(JSON.stringify(value))}
        required={!parameter.allowEmptyValue}
      />
    : <SingleSelect
        items={parameter.vocabulary.map(([value, display]) => ({ value, display }))}
        value={value}
        onChange={onParamValueChange}
        required={!parameter.allowEmptyValue}
      />
}
