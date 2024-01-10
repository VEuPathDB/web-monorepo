import React from 'react';
import IndeterminateCheckbox from '../../inputs/checkboxes/IndeterminateCheckbox';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    let { checked, onChange } = this.props;
    if (typeof onChange === 'function') onChange(!!checked);
  }

  render() {
    let { checked, className, disabled, indeterminate = false } = this.props;
    className = 'Checkbox' + (className ? ' ' + className : '');
    className += ' ' + (checked ? 'Checkbox-Checked' : 'Checkbox-Unchecked');
    className += disabled ? ' Checkbox-Disabled' : '';

    return (
      <div className={className}>
        {indeterminate ? (
          <IndeterminateCheckbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={this.handleClick}
          />
        ) : (
          <input
            type="checkbox"
            checked={checked}
            onChange={this.handleClick}
          />
        )}
      </div>
    );
  }
}

export default Checkbox;
