import React from 'react';
import { DateSelector } from '@veupathdb/wdk-client/lib/Components';
import { paramPropTypes } from '../util/paramUtil';

/**
 * DateParam component
 */
export default class DateParam extends React.PureComponent {
  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (newValue) {
    let { param, onParamValueChange } = this.props;
    onParamValueChange(param, newValue);
  }

  render () {
    let { param, value } = this.props;
    let { minDate, maxDate } = param;
    value = JSON.parse(value);

    return (
      <div className="date-param">
        <DateSelector
          value={value}
          start={minDate}
          end={maxDate}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

DateParam.propTypes = paramPropTypes;
