import React from 'react';

interface IconProps {
  fa: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
}

class Icon extends React.PureComponent<IconProps> {
  render() {
    let { fa, className, onClick, style } = this.props;
    className = `icon fa fa-${fa} ${className || ''}`;
    return (
      <i onClick={onClick} style={style} className={className}>
        {' '}
      </i>
    );
  }
}

export default Icon;
