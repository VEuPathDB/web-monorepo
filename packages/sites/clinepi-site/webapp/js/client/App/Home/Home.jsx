import React from 'react';

import './HomePage.scss';
import homeSections from 'Client/data/homeSections';
import { Showcase } from 'Client/App/Showcase';

class HomePage extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { prefix } = this.props;

    return (
      <div className="HomePage">
        {homeSections.map((section, idx) => (
          <Showcase content={section} prefix={prefix} key={idx} />
        ))}
      </div>
    );
  }
};

export default HomePage;
