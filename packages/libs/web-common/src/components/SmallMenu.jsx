import { isEmpty, identity } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

/**
 * Small menu that appears in header
 */
const SmallMenu = ({ items, webAppUrl }) => isEmpty(items) ? null : (
  <ul className="eupathdb-SmallMenu">
    {items.filter(identity).map((item, index) =>
      <Item key={item.id || '_' + index} item={item} webAppUrl={webAppUrl}/>
    )}
  </ul>
)

SmallMenu.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  items: PropTypes.array
}

export default SmallMenu

const Item = (props) => (
  <li className={'eupathdb-SmallMenuItem ' + (props.item.liClassName || '')}>

    { props.item.url ? <ItemUrl {...props}/>
    : props.item.webAppUrl ? <ItemWebAppUrl {...props}/>
    : props.item.route ? <ItemRoute {...props}/>
    : safeHtml(props.item.text) }

    <SmallMenu {...props} items={props.item.children} />
  </li>
)

const ItemUrl = ({ item }) => (
  <a
    className={item.className}
    title={item.tooltip}
    href={item.url}
    target={item.target}
    onClick={item.onClick}
  >{safeHtml(item.text)}</a>
)

const ItemWebAppUrl = ({ item, webAppUrl }) => (
  <a
    className={item.className}
    title={item.tooltip}
    href={`${webAppUrl}${item.webAppUrl}`}
    onClick={item.onClick}
    target={item.target}
  >{safeHtml(item.text)}</a>
)

const ItemRoute = ({ item, webAppUrl }) => (
  <Link
    className={item.className}
    title={item.tooltip}
    to={item.route}
    onClick={item.onClick}
    target={item.target}
  >{safeHtml(item.text)}</Link>
)
