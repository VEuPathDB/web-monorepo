import React from 'react';

import StudyCard from './StudyCard';

class StudyCardList extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { list, prefix } = this.props;
    return !list ? null : (
      <div className="CardList StudyCardList">
        {list.map((study, idx) => <StudyCard key={idx} study={study} prefix={prefix} />)}
      </div>
    );
  }
};

export default StudyCardList;
