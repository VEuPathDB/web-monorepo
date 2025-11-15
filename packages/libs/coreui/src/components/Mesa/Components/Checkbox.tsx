import React from 'react';
import IndeterminateCheckbox from '../../inputs/checkboxes/IndeterminateCheckbox';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}

class Checkbox extends React.Component<CheckboxProps> {
  constructor(props: CheckboxProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(
    isCheckedOrEvent: boolean | React.ChangeEvent<HTMLInputElement>
  ): void {
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
            name=""
            value=""
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
