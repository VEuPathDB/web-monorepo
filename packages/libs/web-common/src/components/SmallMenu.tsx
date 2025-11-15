import { isEmpty, identity } from 'lodash';
import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export interface SmallMenuItem {
  id?: string;
  text: string;
  url?: string;
  webAppUrl?: string;
  route?: string;
  className?: string;
  liClassName?: string;
  tooltip?: string;
  target?: string;
  onClick?: () => void;
  children?: SmallMenuItem[];
}

interface SmallMenuProps {
  webAppUrl: string;
  items?: SmallMenuItem[];
}

/**
 * Small menu that appears in header
 */
const SmallMenu = ({ items, webAppUrl }: SmallMenuProps) =>
  isEmpty(items) ? null : (
    <ul className="eupathdb-SmallMenu">
      {items.filter(identity).map((item, index) => (
        <Item key={item.id || '_' + index} item={item} webAppUrl={webAppUrl} />
      ))}
    </ul>
  );

export default SmallMenu;

interface ItemProps {
  item: SmallMenuItem;
  webAppUrl: string;
}

const Item = (props: ItemProps) => (
  <li className={'eupathdb-SmallMenuItem ' + (props.item.liClassName || '')}>
    {props.item.url ? (
      <ItemUrl {...props} />
    ) : props.item.webAppUrl ? (
      <ItemWebAppUrl {...props} />
    ) : props.item.route ? (
      <ItemRoute {...props} />
    ) : (
      safeHtml(props.item.text)
    )}

    <SmallMenu {...props} items={props.item.children} />
  </li>
);

const ItemUrl = ({ item }: ItemProps) => (
  <a
    className={item.className}
    title={item.tooltip}
    href={item.url}
    target={item.target}
    onClick={item.onClick}
  >
    {safeHtml(item.text)}
  </a>
);

const ItemWebAppUrl = ({ item, webAppUrl }: ItemProps) => (
  <a
    className={item.className}
    title={item.tooltip}
    href={`${webAppUrl}${item.webAppUrl}`}
    onClick={item.onClick}
    target={item.target}
  >
    {safeHtml(item.text)}
  </a>
);

const ItemRoute = ({ item, webAppUrl }: ItemProps) => (
  <Link
    className={item.className}
    title={item.tooltip}
    to={item.route}
    onClick={item.onClick}
    target={item.target}
  >
    {safeHtml(item.text)}
  </Link>
);
