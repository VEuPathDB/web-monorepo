import React from 'react';

import Icon from '../Components/Icon';

class Checkbox extends React.Component {
  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick (e) {
    let { checked, onChange } = this.props;
    if (typeof onChange === 'function') onChange(!!checked);
  }

  render () {
    let { checked, className, disabled } = this.props;
    className = 'Checkbox' + (className ? ' ' + className : '');
    className += ' ' + (checked ? 'Checkbox-Checked' : 'Checkbox-Unchecked');
    className += disabled ? ' Checkbox-Disabled' : '';

    return (
      <div className={className} onClick={disabled ? null : this.handleClick}>
        <input type="checkbox" checked={checked} />
      </div>
    );
  }
};

export default Checkbox;
