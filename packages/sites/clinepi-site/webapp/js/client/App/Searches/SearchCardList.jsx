import React from 'react';

import SearchCard from './SearchCard';

class SearchCardList extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { list } = this.props;
    return !list ? null : (
      <div className="CardList SearchCardList">
        {list.map((search, idx) => <SearchCard search={search} key={idx} />)}
      </div>
    );
  }
};

export default SearchCardList;
