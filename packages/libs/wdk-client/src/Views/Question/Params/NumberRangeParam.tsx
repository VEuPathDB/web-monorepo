import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import NumberRangeSelector from 'wdk-client/Components/InputControls/NumberRangeSelector';
import { NumberRangeParam, Parameter } from 'wdk-client/Utils/WdkModel';

import { createParamModule, Props } from 'wdk-client/Views/Question/Params/Utils';


export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is NumberRangeParam {
  return param.type === 'number-range';
}

function Component(props: Props<NumberRangeParam, void>) {
  const { parameter, value, onParamValueChange } = props;
  return (
    <NumberRangeSelector
      start={parameter.min}
      end={parameter.max}
      step={parameter.increment}
      value={JSON.parse(value)}
      onChange={value => onParamValueChange(JSON.stringify(value))}
      required={!parameter.allowEmptyValue}
    />
  )
}
