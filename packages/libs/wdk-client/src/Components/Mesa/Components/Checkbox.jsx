import React from 'react';

import Icon from 'wdk-client/Components/Mesa/Components/Icon';

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
      <div className={className}>
        <input type="checkbox" checked={checked} onChange={this.handleClick} />
      </div>
    );
  }
};

export default Checkbox;
