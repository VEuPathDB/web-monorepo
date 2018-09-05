import React from 'react';
import PropTypes from 'prop-types';

import './wdk-NumberRangeSelector.scss';
import NumberSelector from './NumberSelector';

type Value = {
  min: number;
  max: number;
}

type Props = {
  start: number;
  end: number;
  value: Value;
  onChange: (value: Value) => void;
  step: number;
};


/**
 * Widget for selecting a numeric range.
 */
class NumberRangeSelector extends React.Component<Props> {

  static propTypes = {
    start: PropTypes.number,
    end: PropTypes.number,
    value: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number
    }),
    onChange: PropTypes.func,
    step: PropTypes.number
  };

  constructor (props: Props) {
    super(props);

    this.handleMinChange = this.handleMinChange.bind(this);
    this.handleMaxChange = this.handleMaxChange.bind(this);
  }

  handleMinChange (min: number) {
    let { value, onChange } = this.props;
    let { max } = value;
    max = max * 1;
    min = min * 1;

    if (max < min) max = min;
    if (onChange) onChange({ min, max });
  }

  handleMaxChange (max: number) {
    let { value, onChange } = this.props;
    let { min } = value;
    max = max * 1;
    min = min * 1;

    if (min > max) min = max;
    if (onChange) onChange({ min, max });
  }

  render () {
    let { start, end, value, step } = this.props;
    if (typeof value.min === 'string') value.min = value.min * 1;
    if (typeof value.max === 'string') value.max = value.max * 1;

    return (
      <div className="wdk-NumberRangeSelector">
        <NumberSelector start={start} end={end} step={step} onChange={this.handleMinChange} value={value.min} />
        <label>&nbsp; to &nbsp;</label>
        <NumberSelector start={start} end={end} step={step} onChange={this.handleMaxChange} value={value.max} />
      </div>
    );
  }
}

export default NumberRangeSelector;
