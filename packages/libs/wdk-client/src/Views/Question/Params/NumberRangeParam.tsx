import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import NumberRangeSelector from '../../../Components/InputControls/NumberRangeSelector';
import { NumberRangeParam, Parameter } from '../../../Utils/WdkModel';

import { createParamModule, Props } from './Utils';


export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is NumberRangeParam {
  return param.type === 'NumberRangeParam';
}

function Component(props: Props<NumberRangeParam, void>) {
  const { parameter, value, onParamValueChange } = props;
  return (
    <NumberRangeSelector
      start={parameter.min}
      end={parameter.max}
      step={parameter.step}
      value={JSON.parse(value)}
      onChange={value => onParamValueChange(JSON.stringify(value))}
    />
  )
}
