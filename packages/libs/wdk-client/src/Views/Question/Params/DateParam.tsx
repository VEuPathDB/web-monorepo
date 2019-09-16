import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import DateSelector from 'wdk-client/Components/InputControls/DateSelector';
import { DateParam, Parameter } from 'wdk-client/Utils/WdkModel';

import { createParamModule, Props } from 'wdk-client/Views/Question/Params/Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is DateParam {
  return param.type === 'date';
}

function Component(props: Props<DateParam, undefined>) {
  const { parameter, value, onParamValueChange } = props;
  return (
    <DateSelector
      start={parameter.minDate}
      end={parameter.maxDate}
      value={value}
      onChange={onParamValueChange}
      required={!parameter.allowEmptyValue}
    />
  )
}
