import React from 'react';

import 'wdk-client/Components/InputControls/wdk-DateRangeSelector.scss';
import * as DateUtils from 'wdk-client/Utils/DateUtils';
import DateSelector from 'wdk-client/Components/InputControls/DateSelector';

class DateRangeSelector extends React.Component {
  constructor (props) {
    super(props);

    let { start, end } = props;

    start = DateUtils.isValidDateString(start)
      ? DateUtils.parseDate(start)
      : DateUtils.getEpochStart();

    end = DateUtils.isValidDateString(end)
      ? DateUtils.parseDate(end)
      : DateUtils.getEpochEnd();

    this.state = { start, end };
    this.handleReset = this.handleReset.bind(this);
    this.handleMinValueChange = this.handleMinValueChange.bind(this);
    this.handleMaxValueChange = this.handleMaxValueChange.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    let { start, end } = nextProps;
    start = (start === this.props.start)
      ? this.state.start
      : DateUtils.isValidDateString(start)
        ? DateUtils.parseDate(start)
        : DateUtils.getEpochStart();
    end = (end === this.props.end)
      ? this.state.end
      : DateUtils.isValidDateString(end)
        ? DateUtils.parseDate(end)
        : DateUtils.getEpochEnd();
    this.setState({ start, end })
  }

  handleMinValueChange (min) {
    let { onChange, value } = this.props;
    let { max } = value;
    if (onChange) onChange({ min, max });
  }

  handleMaxValueChange (max) {
    let { onChange, value } = this.props;
    let { min } = value;
    if (onChange) onChange({ min, max });
  }

  handleReset () {
    let { onChange } = this.props;
    let { start, end } = this.state;
    start = DateUtils.formatDateObject(start);
    end = DateUtils.formatDateObject(end);
    if (onChange) onChange({ min: start, max: end });
  }

  render () {
    let { min, max } = this.props.value;
    let { start, end } = this.state;

    start = DateUtils.formatDateObject(start);
    end = DateUtils.formatDateObject(end);

    let alreadyDefault = (start === min && end === max);

    return (
      <div className="wdk-DateRangeSelector wdk-ControlGrid">
        <div className="label-column">
          <div className="label-cell">
            <label>From</label>
          </div>
          <div className="label-cell">
            <label>To</label>
          </div>
          <div className="label-cell">
            <label> </label>
          </div>
        </div>
        <div className="control-column">
          <div className="control-cell">
            <DateSelector start={start} end={end} value={min} onChange={this.handleMinValueChange} />
          </div>
          <div className="control-cell">
            <DateSelector start={start} end={end} value={max} onChange={this.handleMaxValueChange} />
          </div>
          <div className="control-cell">
            <a className={alreadyDefault ? 'disabled' : ''} onClick={this.handleReset}>Reset to Defaults</a>
          </div>
        </div>
      </div>
    );
  }
}

export default DateRangeSelector;
