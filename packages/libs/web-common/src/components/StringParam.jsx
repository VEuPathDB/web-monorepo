import React from 'react';
import { paramPropTypes } from '../util/paramUtil';

/**
 * StringParam component
 */
export default class StringParam extends React.PureComponent {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.state = { pendingValue: props.value };
  }

  handleChange(event) {
    this.setState({
      pendingValue: event.currentTarget.value
    })
  }

  handleBlur() {
    if (this.state.pendingValue !== this.props.value)
      this.props.onParamValueChange(this.props.param, this.state.pendingValue);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value)
      this.setState({ pendingValue: nextProps.value });
  }

  render() {
    const { pendingValue } = this.state;
    const { autoFocus } = this.props;
    return (
      <input
        type="text"
        value={pendingValue}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        autoFocus={autoFocus}
      />
    );
  }

}

StringParam.propTypes = paramPropTypes;
