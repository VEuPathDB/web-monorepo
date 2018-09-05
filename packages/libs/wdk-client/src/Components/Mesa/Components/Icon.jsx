import React from 'react';

class Icon extends React.PureComponent {
  render () {
    let { fa, className, onClick, style } = this.props;
className = `icon fa fa-${fa} ${(className || '')}`;
    return <i onClick={onClick} style={style} className={className}> </i>
  }
};

export default Icon;
