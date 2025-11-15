import React from 'react';

import './SiteMenuItem.scss';
import { IconAlt as Icon, Link } from '@veupathdb/wdk-client/lib/Components';
import { MenuItem } from '../../util/menuItems';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

interface SiteMenuItemConfig {
  webAppUrl: string;
  projectId?: string;
}

interface SiteMenuItemActions {
  showLoginWarning: (message: string, href: string) => void;
}

interface ExtendedMenuItem extends Omit<MenuItem, 'children'> {
  appUrl?: string;
  isVisible?: boolean;
  children?:
    | MenuItem[]
    | ((context: {
        webAppUrl: string;
        projectId?: string;
        isFocused: boolean;
      }) => MenuItem[]);
}

interface SiteMenuItemProps {
  item: ExtendedMenuItem;
  config: SiteMenuItemConfig;
  actions: SiteMenuItemActions;
  user: User;
}

interface SiteMenuItemState {
  isFocused: boolean;
}

class SiteMenuItem extends React.Component<
  SiteMenuItemProps,
  SiteMenuItemState
> {
  constructor(props: SiteMenuItemProps) {
    super(props);
    this.state = { isFocused: false };
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
  }

  focus(event: React.MouseEvent) {
    this.setState({ isFocused: true });
  }

  blur(event: React.MouseEvent | React.TouchEvent) {
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
    let handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
