import React from 'react';

import './SiteMenuItem.scss';
import { IconAlt as Icon, Link } from '@veupathdb/wdk-client/lib/Components';

class SiteMenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isFocused: false };
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
  }

  focus(event) {
    this.setState({ isFocused: true });
  }

  blur(event) {
    this.setState({ isFocused: false });
  }

  render() {
    const { focus, blur } = this;
    const { isFocused } = this.state;
    const { item, config, actions, user } = this.props;
    const {
      id,
      text,
      url,
      appUrl,
      route,
      target,
      loginRequired,
      isVisible = true,
    } = item;
    const { webAppUrl, projectId } = config;

    const { showLoginWarning } = actions;
    const isGuest = user.isGuest;
    let handleClick = (e) => {
      if (item.onClick) {
        item.onClick(e);
      }
      if (item.loginRequired && isGuest) {
        e.preventDefault();
        e.stopPropagation();
        showLoginWarning('use this feature', e.currentTarget.href);
      }
    };

    const children =
      typeof item.children === 'function'
        ? item.children({ webAppUrl, projectId, isFocused })
        : item.children;

    const destination =
      appUrl && appUrl.length
        ? webAppUrl + appUrl
        : url && url.length
        ? url
        : null;

    const className =
      'SiteMenuItem' +
      (children && children.length ? ' SiteMenuItem--HasSubmenu' : '');
    const touchToggle = {
      onTouchStart: isFocused ? blur : focus,
      style: { display: 'inline-block ' },
    };
    return (
      <div
        key={id}
        className={className}
        onMouseEnter={focus}
        onMouseLeave={blur}
        // this lets us preserve react keys when filtering collapsible sections in the studies menu
        style={isVisible ? undefined : { display: 'none' }}
      >
        {destination ? (
          <a
            onClick={handleClick}
            className="SiteMenuItem-Link"
            href={destination}
            target={target}
          >
            {text}
          </a>
        ) : route ? (
          <Link
            onClick={handleClick}
            className="SiteMenuItem-Link"
            to={route}
            target={target}
          >
            {text}
          </Link>
        ) : (
          <span className="SiteMenuItem-Text" {...touchToggle}>
            {text}
          </span>
        )}

        {children && children.length ? (
          <div {...touchToggle}>
            <Icon fa="caret-down" />
          </div>
        ) : null}
        {children && children.length ? (
          <div
            className={
              'SiteMenuItem-Submenu' +
              (isFocused ? '' : ' SiteMenuItem-Submenu--hidden')
            }
          >
            <div className="SiteMenu-Item-Submenu-Inner">
              {children.map((child, idx) => (
                <SiteMenuItem
                  key={idx}
                  item={child}
                  config={config}
                  actions={actions}
                  user={user}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default SiteMenuItem;
