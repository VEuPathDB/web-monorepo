import React from 'react';
import { paramPropTypes } from '../util/paramUtil';
import { DateRangeSelector } from 'wdk-client/Components';

/**
 * DateRange param
*/
export default class DateRangeParam extends React.PureComponent {
  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (newValue) {
    let { param, onParamValueChange } = this.props;
    newValue = JSON.stringify(newValue);
    onParamValueChange(param, newValue);
  }

  render () {
    let { param, value } = this.props;
    let { minDate, maxDate } = param;
    value = JSON.parse(value);

    return (
      <div className="date-range-param">
        <DateRangeSelector
          value={value}
          start={minDate}
          end={maxDate}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

DateRangeParam.propTypes = paramPropTypes;
