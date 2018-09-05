import React from 'react';
import PropTypes from 'prop-types';
import { wrappable } from '../../Utils/ComponentUtils';

class SingleSelect extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    // only call change function passed in if value is indeed changing
    if (event.target.value !== this.props.value) {
      this.props.onChange(event.target.value);
    }
  }

  render() {
    let { name, value, items } = this.props;
    return (
      <select name={name} value={value} onChange={this.onChange}>
        {items.map(item => (
          <option key={item.value} disabled={item.disabled} value={item.value}>{item.display}</option>
        ))}
      </select>
    );
  }
}

SingleSelect.propTypes = {

  /** Value to use for "name" attribute of the select form input **/
  name: PropTypes.string,

  /** Array of items to display in the list **/
  /** [ { value, display } ] */
  items: PropTypes.array.isRequired,

  /** Value of the option element that should be selected **/
  value: PropTypes.string,

  /**
   * Callback function that will be called when user changes selected value.
   * The new (string) value of the selected option will be passed to this
   * function.
   */
  onChange: PropTypes.func
};

export default wrappable(SingleSelect)
