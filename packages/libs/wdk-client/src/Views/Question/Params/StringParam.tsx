import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import { StringParam, Parameter } from '../../../Utils/WdkModel';

import { createParamModule, Props } from './Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is StringParam {
  return param.type === 'StringParam';
}

function Component(props: Props<StringParam, undefined>) {
  const { parameter, value, onParamValueChange } = props;
  return parameter.length <= 50 ? (
    <input
      type="text"
      value={value}
      readOnly={parameter.isReadOnly}
      onChange={e=> onParamValueChange(e.target.value)}
    />
  ) : (
    <textarea
      cols={45}
      rows={Math.ceil(parameter.length / 45)}
      readOnly={parameter.isReadOnly}
      onChange={e => onParamValueChange(e.target.value)}
    >{value}</textarea>
  );
}
