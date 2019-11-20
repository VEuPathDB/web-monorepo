import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import NumberSelector from 'wdk-client/Components/InputControls/NumberSelector';
import { NumberParam, Parameter } from 'wdk-client/Utils/WdkModel';

import { createParamModule, Props } from 'wdk-client/Views/Question/Params/Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is NumberParam {
  return param.type === 'number';
}

function Component(props: Props<NumberParam, undefined>) {
  const { parameter, value, onParamValueChange } = props;
  console.info('Number param', { NumberSelector, props });
  return (
    <NumberSelector
      start={parameter.min}
      end={parameter.max}
      step={parameter.increment}
      value={Number(value)}
      onChange={value => onParamValueChange(String(value))}
      required={!parameter.allowEmptyValue}
    />
  )
}
