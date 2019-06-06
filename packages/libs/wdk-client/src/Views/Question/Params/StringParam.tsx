import { stubTrue as isParamValueValid } from 'lodash';
import React from 'react';

import TextArea from 'wdk-client/Components/InputControls/TextArea';
import TextBox from 'wdk-client/Components/InputControls/TextBox';
import { StringParam, Parameter } from 'wdk-client/Utils/WdkModel';

import { createParamModule, Props } from 'wdk-client/Views/Question/Params/Utils';

export default createParamModule({
  isType,
  isParamValueValid,
  Component
})

function isType(param: Parameter): param is StringParam {
  return param.type === 'string';
}

function Component(props: Props<StringParam, undefined>) {
  const { parameter, value, onParamValueChange } = props;
  const cols = 45;
  const rows = Math.min(20, Math.ceil(parameter.length / cols ));
  return parameter.length <= 50 ? (
    <TextBox
      type="text"
      value={value}
      readOnly={parameter.isReadOnly}
      onChange={onParamValueChange}
    />
  ) : (
    <TextArea
      cols={cols}
      rows={rows}
      readOnly={parameter.isReadOnly}
      value={value}
      onChange={onParamValueChange}
    />
  );
}
