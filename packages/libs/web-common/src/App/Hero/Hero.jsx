import React from 'react';

import './Hero.scss';

class Hero extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { image, position, children } = this.props;
    return (
      <div className="wdk-Hero" style={{  backgroundImage: `url(${image})`, backgroundPosition: position }}>
        <div className="stack">
          {children}
        </div>
      </div>
    );
  }
};

export default Hero;
