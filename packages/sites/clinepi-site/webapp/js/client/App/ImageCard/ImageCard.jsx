import React from 'react';

import './ImageCard.scss';

import { IconAlt as Icon } from 'wdk-client/Components';

class ImageCard extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { card } = this.props;
    const { image, url, title, description, ctaText } = card;
    return (
      <stack className="Card ImageCard">
        <box className="ImageCard-Image" style={{ backgroundImage: `url(${image})`}} />
        <box className="ImageCard-Title">
          <a href={url}>
            <h3 dangerouslySetInnerHTML={{ __html: title }} />
          </a>
          <p>{description}</p>
        </box>
        <a className="ImageCard-Footer" href={url} target="_blank">
          {ctaText} <Icon fa={'chevron-circle-right'} />
        </a>
      </stack>
    );
  }
};

export default ImageCard;
