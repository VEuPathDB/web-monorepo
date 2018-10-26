import React from 'react';

import Icon from 'wdk-client/Components/Mesa/Components/Icon';

class Toggle extends React.Component {
  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick (e) {
    let { enabled, onChange } = this.props;
    if (typeof onChange === 'function') onChange(!!enabled);
  }

  render () {
    let { enabled, className, disabled, style } = this.props;
    className = 'Toggle' + (className ? ' ' + className : '');
    className += ' ' + (enabled ? 'Toggle-On' : 'Toggle-Off');
    className += disabled ? ' Toggle-Disabled' : '';
    let offStyle = {
      fontSize: '1.2rem',
      color: '#989898'
    };
    let onStyle = Object.assign({}, offStyle, {
      color: '#198835'
    });

    return (
      <span
        style={style}
        className={className}
        onClick={disabled ? null : this.handleClick}
      >
        <Icon
          fa={enabled ? 'toggle-on' : 'toggle-off'}
          style={enabled ? onStyle : offStyle}
        />
      </span>
    );
  }
};

export default Toggle;
