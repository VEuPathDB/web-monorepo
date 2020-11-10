import React from 'react';
import { paramPropTypes } from '../util/paramUtil';

import { NumberSelector } from 'wdk-client/Components';

/**
 * Number parameters
 */
export default class NumberParam extends React.PureComponent {
  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (newValue) {
    let { param, onParamValueChange } = this.props;
    onParamValueChange(param, String(newValue));
  }

  render () {
    let { param, value } = this.props;
    let { min, max, integer, step } = param;
    let numberValue = Number(value);
    let stepValue = step != null
      ? Number(step)
      : (integer !== 'false' ? 1 : 0.01);

    return (
      <div className="number-param">
        <NumberSelector
          value={numberValue}
          start={min}
          end={max}
          step={stepValue}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}

NumberParam.propTypes = paramPropTypes;