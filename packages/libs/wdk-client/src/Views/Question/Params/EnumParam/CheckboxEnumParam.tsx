import React from 'react';
import { CheckboxEnumParam, Parameter } from '../../../../Utils/WdkModel';
import { Context, Props, createParamModule } from '../Utils';
import { isEnumParam, valueToArray } from './Utils';

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
  const valueSet = new Set(valueToArray(value));
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (parameter.multiPick) {
      const nextValueSet = new Set(valueSet);
      if (event.target.checked) nextValueSet.add(event.target.value);
      else nextValueSet.delete(event.target.value);
      const nextValue = [ ...nextValueSet ].join(',');
      onParamValueChange(nextValue);
    }
    else {
      onParamValueChange(event.target.value);
    }
  };
  const selectAll = () => onParamValueChange(parameter.vocabulary.map(([term]) => term).join(','));
  const clearAll = () => onParamValueChange('');
  const inputType = parameter.multiPick ? 'checkbox' : 'radio';

  return (
    <React.Fragment>
      {parameter.vocabulary.map(([ term, display ]) => {
        const id = `${ctx.questionName}__${parameter.name}__${term}`;
        return (
          <div key={term}>
            <input id={id} type={inputType} onChange={handleChange} checked={valueSet.has(term)} value={term}/> <label htmlFor={id}>{display}</label>
          </div>
        )
      })}
      {parameter.multiPick && (
        <div style={{ marginTop: '.5rem', fontSize: '.65rem' }}>
          <button type="button" onClick={selectAll} className="wdk-Link">select all</button>
          &nbsp;|&nbsp;
          <button type="button" onClick={clearAll} className="wdk-Link">clear all</button>
        </div>
      )}
    </React.Fragment>
  )
}

