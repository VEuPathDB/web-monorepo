import React from 'react';
import PropTypes from 'prop-types';

import * as DateUtils from 'wdk-client/Utils/DateUtils';
import DateSelector from 'wdk-client/Components/InputControls/DateSelector';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import 'wdk-client/Components/InputControls/wdk-DateRangeSelector.scss';

const cx = makeClassNameHelper('wdk-DateRangeSelector');

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
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
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
    let { value: { min, max }, required = false, inline = false, hideReset = false } = this.props;
    let { start, end } = this.state;

    start = DateUtils.formatDateObject(start);
    end = DateUtils.formatDateObject(end);

    let alreadyDefault = (start === min && end === max);

    return (
      <div className={cx('', inline ? 'inline' : 'grid')}>
        <div className={cx('--Label', 'from')}>
          <label>from</label>
        </div>
        <div className={cx('--Control', 'from')}>
          <DateSelector start={start} end={end} value={min} onChange={this.handleMinValueChange} required={required} />
        </div>
        <div className={cx('--Label', 'to')}>
          <label>to</label>
        </div>
        <div className={cx('--Control', 'to')}>
          <DateSelector start={start} end={end} value={max} onChange={this.handleMaxValueChange} required={required} />
        </div>
        {!hideReset && (
          <div className={cx('--Control', 'reset')}>
            <button type="button" disabled={alreadyDefault} className="link" onClick={this.handleReset}>Reset to Defaults</button>
          </div>
        )}
      </div>
    );
  }
}

DateRangeSelector.propTypes = {
  value: PropTypes.shape({
    min: PropTypes.string.isRequired,
    max: PropTypes.string.isRequired
  }),
  start: PropTypes.string,
  end: PropTypes.string,
  onChange: PropTypes.func,
  // both default to false
  inline: PropTypes.bool,
  hideReset: PropTypes.bool,
  required: PropTypes.bool
}

export default DateRangeSelector;
