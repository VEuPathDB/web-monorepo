import React from 'react';
import { paramPropTypes } from '../util/paramUtil';
import { NumberRangeSelector } from '@veupathdb/wdk-client/lib/Components';

/**
 * NumberRangeParam component
 */
 export default class NumberRangeParam extends React.PureComponent {

   constructor (props) {
     super(props);
     this.handleChange = this.handleChange.bind(this);
   }

   handleChange (newValue) {
     let { param, onParamValueChange } = this.props;
     onParamValueChange(param, JSON.stringify({
       min: String(newValue.min),
       max: String(newValue.max)
     }));
   }

   parseValue(value) {
     let { min, max } = JSON.parse(value);
     return {
       min: Number(min),
       max: Number(max)
     }
   }

   render () {
     let { param, value } = this.props;
     let { min, max, integer, step } = param;
     let parsedValue = this.parseValue(value);
     let stepValue = step != null
      ? Number(step)
      : (integer !== 'false' ? 1 : 0.01);

     if (step) step = step * 1;
     else step = (!integer || integer === 'false' ? 0.01 : 1);

     return (
       <div className="number-range-param">
         <NumberRangeSelector
           value={parsedValue}
           start={min}
           end={max}
           step={stepValue}
           onChange={this.handleChange}
         />
       </div>
     );
   }
 }

NumberRangeParam.propTypes = paramPropTypes;
