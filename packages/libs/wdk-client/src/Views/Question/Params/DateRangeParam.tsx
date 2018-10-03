import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import DateRangeSelector from '../../../Components/InputControls/DateRangeSelector';
import { DateRangeParam, Parameter } from '../../../Utils/WdkModel';

import { createParamModule, Props } from './Utils';


export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is DateRangeParam {
  return param.type === 'DateRangeParam';
}

function Component(props: Props<DateRangeParam, void>) {
  const { parameter, value, onParamValueChange } = props;
  return (
    <DateRangeSelector
      start={parameter.minDate}
      end={parameter.maxDate}
      value={JSON.parse(value)}
      onChange={(value: any) => onParamValueChange(JSON.stringify(value))}
    />
  )
}
