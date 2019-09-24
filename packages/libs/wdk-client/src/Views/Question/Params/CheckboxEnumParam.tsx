import React from 'react';
import CheckboxList from 'wdk-client/Components/InputControls/CheckboxList';
import RadioList from 'wdk-client/Components/InputControls/RadioList';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { CheckboxEnumParam, Parameter } from 'wdk-client/Utils/WdkModel';
import { Props, createParamModule } from 'wdk-client/Views/Question/Params/Utils';
import { isEnumParam, valueToArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';

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
        items={parameter.vocabulary.map(([value, display]) => ({ value, display: safeHtml(display) }))}
        value={valueToArray(value)}
        onChange={value => onParamValueChange(value.join(','))}
      />
    : <RadioList
        items={parameter.vocabulary.map(([value, display]) => ({ value, display: safeHtml(display) }))}
        value={value}
        onChange={onParamValueChange}
        required={!parameter.allowEmptyValue}
      />
}

