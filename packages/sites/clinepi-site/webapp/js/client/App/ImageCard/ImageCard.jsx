import React from 'react';

import './ImageCard.scss';

import { IconAlt as Icon } from 'wdk-client/Components';

class ImageCard extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { card, prefix = '' } = this.props;
    const { appImage, image, appUrl, url, title, description, linkText, linkTarget } = card;

    const imageUrl = typeof appImage !== 'string'
      ? image
      : prefix + appImage;

    const linkUrl = typeof appUrl !== 'string'
      ? url
      : prefix + appUrl;

    return (
      <div className="stack Card ImageCard">
        <div
          className="box ImageCard-Image"
          style={{ backgroundImage: `url(${imageUrl})`}}
        />
        <div className="box ImageCard-Title">
          <a href={linkUrl}>
            <h3 dangerouslySetInnerHTML={{ __html: title }} />
          </a>
          <p dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <a className="ImageCard-Footer" href={linkUrl} target={linkTarget}>
          {linkText} <Icon fa={'chevron-circle-right'} />
        </a>
      </div>
    );
  }
};

export default ImageCard;
