import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';
import 'wdk-client/Components/Banners/wdk-Banner.scss';

class Banner extends React.Component {
  constructor (props) {
    super(props);
  }

  iconFromType (type) {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'danger':
      case 'error':
        return 'exclamation-circle';
      case 'success':
        return 'check-circle';
      case 'info':
        return 'info-circle';
      case 'normal':
      default:
        return 'bell-o';
    }
  }

  isStandardType (type) {
    const types = [
      'warning',
      'danger',
      'success',
      'info',
      'normal',
    ];
    return types.indexOf(type) >= 0;
  }

  render () {
    const { banner, onClose } = this.props;
    const { type, message, pinned, intense } = banner;

    const className = (type && this.isStandardType(type)
      ? type + '-banner'
      : 'normal-banner'
    ) + (banner.intense
      ? ' intense'
      : ''
    ) + ' wdk-Banner';

    let icon = '';
    icon += (banner.icon ? banner.icon : this.iconFromType(type));
    icon += ' banner-icon ';
    icon += (banner.intense ? 'intense' : '');

    return (
      <div className={className}>
        <Icon fa={icon} />
        <span>{message}</span>
        {pinned || !onClose ? null : (
          <a className="collapse-link" onClick={onClose}>
            <Icon fa="times" />
          </a>
        )}
      </div>
    );
  }
}

export default Banner;
