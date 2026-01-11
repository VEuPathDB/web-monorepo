import React, { ReactNode } from 'react';

import { OptionsDefaults } from './Defaults';
import OverScroll from './Components/OverScroll';
import TruncatedText from './Components/TruncatedText';
import { stringValue } from './Utils/Utils';
import { CellProps } from './types';

interface WdkLinkValue {
  displayText: string;
  url?: string;
}

interface LinkValue {
  href?: string | null;
  target?: string;
  text: string;
}

const Templates = {
  textCell<Row, Key = string>({
    key,
    value,
    column,
  }: CellProps<Row, Key>): ReactNode {
    const { truncated } = column;
    const className = 'Cell Cell-' + key;
    const text = stringValue(value);

    return truncated ? (
      <TruncatedText className={className} text={text} />
    ) : (
      <div className={className}>{text}</div>
    );
  },

  numberCell<Row, Key = string>({
    key,
    value,
  }: CellProps<Row, Key>): ReactNode {
    const className = 'Cell NumberCell Cell-' + key;
    const display =
      typeof value === 'number' ? value.toLocaleString() : stringValue(value);

    return <div className={className}>{display}</div>;
  },

  wdkLinkCell<Row, Key = string>({
    key,
    value,
  }: CellProps<Row, Key>): ReactNode {
    const className = 'Cell wdkLinkCell Cell-' + key;
    const typedValue = value as WdkLinkValue;
    let { displayText, url } = typedValue;
    let href = url ? url : '#';
    let text = displayText.length ? typedValue.displayText : href;
    const textElement = <div dangerouslySetInnerHTML={{ __html: text }} />;
    let target = '_blank';

    const props = { href, target, className };

    return <a {...props}>{textElement}</a>;
  },

  linkCell<Row, Key = string>({ key, value }: CellProps<Row, Key>): ReactNode {
    const className = 'Cell LinkCell Cell-' + key;
    const defaults: LinkValue = { href: null, target: '_blank', text: '' };
    let { href, target, text } =
      typeof value === 'object' && value !== null
        ? (value as LinkValue)
        : defaults;
    const finalHref = href
      ? href
      : typeof value === 'string'
      ? value
      : undefined;
    text = text.length ? text : finalHref ?? '';

    const props = { href: finalHref, target, className, name: text };

    return finalHref ? <a {...props}>{text}</a> : null;
  },

  htmlCell<Row, Key = string>({
    key,
    value,
    column,
  }: CellProps<Row, Key>): ReactNode {
    const { truncated } = column;
    const className = 'Cell HtmlCell Cell-' + key;
    const content = (
      <div dangerouslySetInnerHTML={{ __html: value as string }} />
    );
    const maxHeight = truncated === true ? '16em' : truncated;

    return truncated ? (
      <div
        className={className}
        style={{ maxHeight, overflowY: 'auto' } as React.CSSProperties}
      >
        {content}
      </div>
    ) : (
      <div className={className}>{content}</div>
    );
  },

  heading<Row, Key = string>({
    key,
    column,
  }: Pick<CellProps<Row, Key>, 'key' | 'column'>): ReactNode {
    const name = column.name;
    const className = 'Cell HeadingCell HeadingCell-' + key;
    const content = <b>{name || String(key)}</b>;

    return <div className={className}>{content}</div>;
  },
};

export default Templates;
