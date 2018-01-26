import React from 'react';

import './ImageCard.scss';

import { IconAlt as Icon } from 'wdk-client/Components';

class ImageCard extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { card, prefix = '' } = this.props;
    const { appImage, image, appUrl, url, title, description, linkText } = card;

    const imageUrl = typeof appImage !== 'string'
      ? image
      : prefix + appImage;

    const linkUrl = typeof appUrl !== 'string'
      ? url
      : prefix + appUrl;

    return (
      <stack className="Card ImageCard">
        <box
          className="ImageCard-Image"
          style={{ backgroundImage: `url(${imageUrl})`}}
        />
        <box className="ImageCard-Title">
          <a href={linkUrl}>
            <h3 dangerouslySetInnerHTML={{ __html: title }} />
          </a>
          <p dangerouslySetInnerHTML={{ __html: description }} />
        </box>
        <a className="ImageCard-Footer" href={linkUrl} target="_blank">
          {linkText} <Icon fa={'chevron-circle-right'} />
        </a>
      </stack>
    );
  }
};

export default ImageCard;
