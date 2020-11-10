import React from 'react';
import FilterParamNew from './FilterParamNew';
import FlatVocabParam from './FlatVocabParam';
import StringParam from './StringParam';
import DateParam from './DateParam';
import DateRangeParam from './DateRangeParam';
import NumberParam from './NumberParam';
import NumberRangeParam from './NumberRangeParam';
import { paramPropTypes } from '../util/paramUtil';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

/**
 * Param component
 */
function Param(props) {
  const ParamComponent = props.findParamComponent(props.param);
  if (ParamComponent == null) {
    return (
      <div>
        {props.param.displayName} {props.param.defaultValue}
      </div>
    )
  }
  return <ParamComponent {...props}/>
}

Param.defaultProps = {
  findParamComponent
};

/**
 * Lookup Param component by param type
 */
function findParamComponent(param) {
  switch(param.type) {
    case 'filter': return FilterParamNew;
    case 'string': return StringParam;
    case 'single-pick-vocabulary': return FlatVocabParam;
    case 'date': return DateParam;
    case 'date-range': return DateRangeParam;
    case 'number': return NumberParam;
    case 'number-range': return NumberRangeParam;
    default: return null;
  }
}

Param.propTypes = paramPropTypes;

export default wrappable(Param);
