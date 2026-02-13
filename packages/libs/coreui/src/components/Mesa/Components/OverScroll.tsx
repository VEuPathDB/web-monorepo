import React from 'react';

interface OverScrollProps {
  className?: string;
  height?: number;
  children?: React.ReactNode;
}

class OverScroll extends React.Component<OverScrollProps> {
  constructor(props: OverScrollProps) {
    super(props);
  }

  render() {
    let { className, height } = this.props;
    className = 'OverScroll' + (className ? ' ' + className : '');
    const heightValue = typeof height === 'number' ? height + 'px' : 'none';

    const style: React.CSSProperties = {
      maxHeight: heightValue,
      overflowY: 'auto',
    };

    return (
      <div className={className}>
        <div className="OverScroll-Inner" style={style}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default OverScroll;
