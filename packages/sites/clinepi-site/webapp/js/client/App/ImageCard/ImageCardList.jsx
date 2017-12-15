import React from 'react';

import ImageCard from './ImageCard';

class ImageCardList extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { list } = this.props;
    return !list ? null : (
      <div className="CardList ImageCardList">
        {list.map((card, idx) => <ImageCard card={card} key={idx} />)}
      </div>
    );
  }
};

export default ImageCardList;
