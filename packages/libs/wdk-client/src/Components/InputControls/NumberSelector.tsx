import{ debounce } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  start: number;
  end: number;
  value: number;
  onChange: (value: number) => void;
  step: number;
  size?: number;
};

type State = {
  internalValue: number | string;
}

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
    size: PropTypes.number
  };

  debouncedNotifyChange = debounce(this.notifyChange, 750);

  constructor (props:Props) {
    super(props);
    this.handleBlurEvent = this.handleBlurEvent.bind(this);
    this.handleChangeEvent = this.handleChangeEvent.bind(this);
    this.state = { internalValue: props.value };
  }

  componentWillReceiveProps(nextProps:Props) {
    this.setState({ internalValue: nextProps.value });
  }

  handleChangeEvent (e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ internalValue: e.target.value }, () => this.debouncedNotifyChange());
  }

  handleBlurEvent (e: React.FocusEvent<HTMLInputElement>) {
    let { start, end } = this.props;
    let value = Number(e.currentTarget.value);
    if (value < start) value = start;
    if (value > end) value = end;
    this.setState({ internalValue: value }, () => this.notifyChange());
  }

  notifyChange() {
    const { onChange } = this.props;
    if (onChange == null) return;
    onChange(Number(this.state.internalValue));
  }

  render () {
    let { start, end, step, size } = this.props;
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
        />
      </span>
    );
  }
}

export default NumberSelector;
