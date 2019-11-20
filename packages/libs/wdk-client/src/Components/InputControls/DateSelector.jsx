import React from 'react';
import * as DateUtils from 'wdk-client/Utils/DateUtils';

import 'wdk-client/Components/InputControls/wdk-DateSelector.scss';
import Select from 'wdk-client/Components/InputControls/SingleSelect';

class DateSelector extends React.Component {
  constructor (props) {
    super(props);
    let { value, start, end } = props;

    let { year, month, day } = DateUtils.isValidDateString(value)
      ? DateUtils.parseDate(value)
      : { year: currentYear, month: 1, day: 1 };

    start = DateUtils.isValidDateString(start)
      ? DateUtils.parseDate(start)
      : DateUtils.getEpochStart();

    end = DateUtils.isValidDateString(end)
      ? DateUtils.parseDate(end)
      : DateUtils.getEpochEnd();

    let initial = JSON.stringify([ year, month, day ]);
    ({ year, month, day } = DateUtils.conformDateToBounds({ year, month, day }, { start, end }));

    // if ('onChange' in props && JSON.stringify([ year, month, day ]) !== initial) {
    //   props.onChange(DateUtils.formatDate(year, month, day));
    // };

    this.state = { year, month, day, value, start, end };

    this.handleYearChange = this.handleYearChange.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
    this.handleDayChange = this.handleDayChange.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  handleYearChange (year) {
    year = year * 1;
    let { month, day, start, end } = this.state;
    ({ year, month, day } = DateUtils.conformDateToBounds({ year, month, day }, { start, end }));

    let result = DateUtils.formatDate(year, month, day);
    if (!DateUtils.isValidDateString(result)) return;
    if ('onChange' in this.props) this.props.onChange(result);
  }

  handleMonthChange (month) {
    month = month * 1;
    let { year, day, start, end } = this.state;
    ({ year, month, day } = DateUtils.conformDateToBounds({ year, month, day }, { start, end }));

    let result = DateUtils.formatDate(year, month, day);
    if (!DateUtils.isValidDateString(result)) return;
    if ('onChange' in this.props) this.props.onChange(result);
  }

  handleDayChange (day) {
    day = day * 1;
    let { year, month, start, end } = this.state;
    ({ year, month, day } = DateUtils.conformDateToBounds({ year, month, day }, { start, end }));

    let result = DateUtils.formatDate(year, month, day);
    if (!DateUtils.isValidDateString(result)) return;
    if ('onChange' in this.props) this.props.onChange(result);
  }

  componentWillReceiveProps (nextProps) {
    let { value, start, end } = nextProps;
    if (value && value === this.props.value && this.state.value) return; // No change
    let { year, month, day } = DateUtils.parseDate(value);

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

    if (!DateUtils.isValidDateString(value)) {
      let message;
      if (this.state.value) {
        message = `<DateSelector> received an invalid {value} property. `;
        message += `Falling back to existing valid value.`;
        message += `Provide a {value} prop with a valid 'YYYY-MM-DD' formatted date.`;
        return console.warn(message);
      } else {
        message = `<DateSelector> received an invalid initial {value} property. `;
        message += `Provide a {value} prop with a valid 'YYYY-MM-DD' formatted date.`;
        return new Error(message);
      }
    };

    this.setState({ value, year, month, day, start, end });
  }

  render () {
    let { value, onChange, required = false } = this.props;
    let { year, month, day, start, end } = this.state;

    const yearOptions = DateUtils.generateYearList(start.year, end.year)
      .map(y => ({
        value: y.toString(),
        display: y.toString(),
        disabled: (y < start.year || y > end.year)
      }));
    const monthOptions = DateUtils.generateMonthList()
      .map(m => ({
        value: m.toString(),
        display: DateUtils.getMonthName(m),
        disabled: (year <= start.year && m < start.month) ||
                  (year >= end.year && m > end.month)
      }))
    const dayOptions = DateUtils.generateDayListByMonth(month, year)
      .map(d => ({
        value: d.toString(),
        display: d.toString(),
        disabled: (year <= start.year && month <= start.month && d < start.day) ||
                  (year >= end.year && month >= end.month && d > end.day)
      }));

    return (
      <div className="wdk-DateSelector">
        <Select value={year.toString()} name="yearSelection" items={yearOptions} onChange={this.handleYearChange} required={required} />
        <Select value={month.toString()} name="monthSelection" items={monthOptions} onChange={this.handleMonthChange} required={required} />
        <Select value={day.toString()} name="daySelection" items={dayOptions} onChange={this.handleDayChange} required={required} />
      </div>
    );
  };
};

export default DateSelector;
