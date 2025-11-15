import React from 'react';

import './Hero.scss';

interface HeroProps {
  image: string;
  position?: string;
  children?: React.ReactNode;
}

class Hero extends React.Component<HeroProps> {
  render() {
    const { image, position, children } = this.props;
    return (
      <div
        className="wdk-Hero"
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: position,
        }}
      >
        <div className="stack">{children}</div>
      </div>
    );
  }
}

export default Hero;
