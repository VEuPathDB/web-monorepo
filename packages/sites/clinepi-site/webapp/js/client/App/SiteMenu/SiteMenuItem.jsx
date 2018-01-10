import React from 'react';

import { IconAlt as Icon } from 'wdk-client/Components';

class SiteMenuItem extends React.Component {
  constructor (props) {
    super(props);
    this.state = { isHovered: false };
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter (event) {
    this.setState({ isHovered: true });
  }

  onMouseLeave (event) {
    this.setState({ isHovered: false });
  }

  render () {
    const { onMouseEnter, onMouseLeave } = this;
    const { isHovered } = this.state;
    const { item, config } = this.props;
    const { id, text, url, appUrl, target } = item;
    const { webAppUrl, projectId } = config;

    const children = (typeof item.children === 'function')
      ? item.children({ webAppUrl, projectId })
      : item.children;

    const destination = appUrl && appUrl.length
      ? webAppUrl + appUrl
      : url && url.length
        ? url
        : null;

    const className = 'SiteMenuItem' + (children && children.length ? ' SiteMenuItem--HasSubmenu' : '');

    return (
      <box className={className} key={id} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      	{destination
          ? <a className="SiteMenuItem-Link" href={destination} target={target}>{text}</a>
          : <span className="SiteMenuItem-Text">{text}</span>
        }
        {children && children.length
          ? <Icon fa="caret-down" />
          : null
        }
        {children && children.length
          ? (
            <stack className={'SiteMenuItem-Submenu' + (isHovered ? '' : ' SiteMenuItem-Submenu--hidden')}>
              {children.map((child, idx) => (
                <SiteMenuItem
                  key={idx}
                  item={child}
                  config={config}
                />
              ))}
            </stack>
          )
          : null
        }
      </box>
    );
  }
};

export default SiteMenuItem;
