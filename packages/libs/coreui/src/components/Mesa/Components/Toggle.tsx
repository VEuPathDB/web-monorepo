import React from 'react';

import Icon from './Icon';

interface ToggleProps {
  enabled: boolean;
  onChange?: (enabled: boolean) => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

class Toggle extends React.Component<ToggleProps> {
  constructor(props: ToggleProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e: React.MouseEvent): void {
    let { enabled, onChange } = this.props;
    if (typeof onChange === 'function') onChange(!!enabled);
  }

  render() {
    let { enabled, className, disabled, style } = this.props;
    className = 'Toggle' + (className ? ' ' + className : '');
    className += ' ' + (enabled ? 'Toggle-On' : 'Toggle-Off');
    className += disabled ? ' Toggle-Disabled' : '';
    let offStyle: React.CSSProperties = {
      fontSize: '1.2rem',
      color: '#989898',
    };
    let onStyle: React.CSSProperties = Object.assign({}, offStyle, {
      color: '#198835',
    });

    return (
      <span
        style={style}
        className={className}
        onClick={disabled ? undefined : this.handleClick}
      >
        <Icon
          fa={enabled ? 'toggle-on' : 'toggle-off'}
          style={enabled ? onStyle : offStyle}
        />
      </span>
    );
  }
}

export default Toggle;
