import { debounce } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  start: number;
  end: number;
  value: number;
  onChange: (value: number) => void;
  step: number;
  size?: number;
  required?: boolean;
};

type State = {
  internalValue: number | string;
};

/**
 * Widget for selecting a single number
 */
class NumberSelector extends React.Component<Props, State> {
  static propTypes = {
    start: PropTypes.number,
    end: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
    step: PropTypes.number,
    size: PropTypes.number,
    required: PropTypes.bool,
  };

  debouncedNotifyChange = debounce(this.notifyChange, 750);

  constructor(props: Props) {
    super(props);
    this.handleBlurEvent = this.handleBlurEvent.bind(this);
    this.handleChangeEvent = this.handleChangeEvent.bind(this);
    this.state = { internalValue: props.value };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({ internalValue: nextProps.value });
  }

  handleChangeEvent(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ internalValue: e.target.value }, () =>
      this.debouncedNotifyChange()
    );
  }

  handleBlurEvent(e: React.FocusEvent<HTMLInputElement>) {
    const value =
      e.currentTarget.value === '' ? this.props.value : e.currentTarget.value;
    this.setState({ internalValue: value }, () => this.notifyChange());
  }

  handleFocusEvent(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.select();
  }

  notifyChange() {
    const { onChange } = this.props;
    const { internalValue } = this.state;
    if (onChange == null || internalValue === '') return;
    onChange(Number(internalValue));
  }

  render() {
    let { start, end, step, size, required = false } = this.props;
    let { internalValue: value } = this.state;
    if (!step) step = 1;
    if (!size) size = end + step;
    let width = Math.max(size.toString().length, 4);
    let style = { width: width + 'em' };
    return (
      <span className="wdk-NumberSelector">
        <input
          type="number"
          style={style}
          min={start}
          max={end}
          step={step}
          value={value}
          onChange={this.handleChangeEvent}
          onBlur={this.handleBlurEvent}
          onFocus={this.handleFocusEvent}
          required={required}
        />
      </span>
    );
  }
}

export default NumberSelector;
