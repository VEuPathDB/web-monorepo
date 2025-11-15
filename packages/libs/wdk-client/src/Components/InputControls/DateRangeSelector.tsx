import React from 'react';

import * as DateUtils from '../../Utils/DateUtils';
import DateSelector from '../../Components/InputControls/DateSelector';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

import '../../Components/InputControls/wdk-DateRangeSelector.scss';

const cx = makeClassNameHelper('wdk-DateRangeSelector');

interface DateRangeValue {
  min: string;
  max: string;
}

interface DateRangeSelectorProps {
  value: DateRangeValue;
  start?: string;
  end?: string;
  onChange?: (value: DateRangeValue) => void;
  inline?: boolean;
  hideReset?: boolean;
  required?: boolean;
}

interface DateRangeSelectorState {
  start: DateUtils.DateObject;
  end: DateUtils.DateObject;
}

class DateRangeSelector extends React.Component<
  DateRangeSelectorProps,
  DateRangeSelectorState
> {
  constructor(props: DateRangeSelectorProps) {
    super(props);

    let { start, end } = props;

    const startStr =
      start && DateUtils.isValidDateString(start)
        ? DateUtils.formatDateObject(DateUtils.parseDate(start))
        : DateUtils.formatDateObject(DateUtils.getEpochStart());

    const endStr =
      end && DateUtils.isValidDateString(end)
        ? DateUtils.formatDateObject(DateUtils.parseDate(end))
        : DateUtils.formatDateObject(DateUtils.getEpochEnd());

    this.state = {
      start: DateUtils.parseDate(startStr),
      end: DateUtils.parseDate(endStr),
    };
    this.handleReset = this.handleReset.bind(this);
    this.handleMinValueChange = this.handleMinValueChange.bind(this);
    this.handleMaxValueChange = this.handleMaxValueChange.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps: DateRangeSelectorProps) {
    let { start, end } = nextProps;
    const startStr =
      start === this.props.start
        ? DateUtils.formatDateObject(this.state.start)
        : start && DateUtils.isValidDateString(start)
        ? start
        : DateUtils.formatDateObject(DateUtils.getEpochStart());
    const endStr =
      end === this.props.end
        ? DateUtils.formatDateObject(this.state.end)
        : end && DateUtils.isValidDateString(end)
        ? end
        : DateUtils.formatDateObject(DateUtils.getEpochEnd());
    this.setState({
      start: DateUtils.parseDate(startStr),
      end: DateUtils.parseDate(endStr),
    });
  }

  handleMinValueChange = (min: string) => {
    const { onChange, value } = this.props;
    const { max } = value;
    if (onChange) onChange({ min, max });
  };

  handleMaxValueChange = (max: string) => {
    const { onChange, value } = this.props;
    const { min } = value;
    if (onChange) onChange({ min, max });
  };

  handleReset = () => {
    const { onChange } = this.props;
    const { start, end } = this.state;
    const startFormatted = DateUtils.formatDateObject(start);
    const endFormatted = DateUtils.formatDateObject(end);
    if (onChange) onChange({ min: startFormatted, max: endFormatted });
  };

  render() {
    const {
      value: { min, max },
      required = false,
      inline = false,
      hideReset = false,
    } = this.props;
    const { start, end } = this.state;

    const startFormatted = DateUtils.formatDateObject(start);
    const endFormatted = DateUtils.formatDateObject(end);

    const alreadyDefault = startFormatted === min && endFormatted === max;

    return (
      <div className={cx('', inline ? 'inline' : 'grid')}>
        <div className={cx('--Label', 'from')}>
          <label>from</label>
        </div>
        <div className={cx('--Control', 'from')}>
          <DateSelector
            start={startFormatted}
            end={endFormatted}
            value={min}
            onChange={this.handleMinValueChange}
            required={required}
          />
        </div>
        <div className={cx('--Label', 'to')}>
          <label>to</label>
        </div>
        <div className={cx('--Control', 'to')}>
          <DateSelector
            start={startFormatted}
            end={endFormatted}
            value={max}
            onChange={this.handleMaxValueChange}
            required={required}
          />
        </div>
        {!hideReset && (
          <div className={cx('--Control', 'reset')}>
            <button
              type="button"
              disabled={alreadyDefault}
              className="link"
              onClick={this.handleReset}
            >
              Reset to Defaults
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default DateRangeSelector;
