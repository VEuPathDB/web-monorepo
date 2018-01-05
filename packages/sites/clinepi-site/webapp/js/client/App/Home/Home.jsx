import React from 'react';

import './HomePage.scss';
import getSections from 'Client/data/Sections';
import { Showcase } from 'Client/App/Showcase';

class HomePage extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { prefix } = this.props;
    const Sections = getSections(prefix);

    return (
      <div className="HomePage">
        {Sections.map((section, idx) => (
          <Showcase content={section} prefix={prefix} key={idx} />
        ))}
      </div>
    );
  }
};

export default HomePage;
