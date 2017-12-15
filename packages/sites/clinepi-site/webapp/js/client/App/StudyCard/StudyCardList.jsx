import React from 'react';

import StudyCard from './StudyCard';

class StudyCardList extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { list } = this.props;
    return !list ? null : (
      <div className="CardList StudyCardList">
        {list.map((study, idx) => <StudyCard key={idx} study={study} />)}
      </div>
    );
  }
};

export default StudyCardList;
