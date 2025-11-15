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
  textCell<Row>({ key, value, column }: CellProps<Row>): ReactNode {
    const { truncated } = column as any;
    const className = 'Cell Cell-' + key;
    const text = stringValue(value);

    return truncated ? (
      <TruncatedText
        className={className}
        cutoff={truncated ? OptionsDefaults.overflowHeight : null}
        text={text}
      />
    ) : (
      <div className={className}>{text}</div>
    );
  },

  numberCell<Row>({ key, value }: CellProps<Row>): ReactNode {
    const className = 'Cell NumberCell Cell-' + key;
    const display =
      typeof value === 'number' ? value.toLocaleString() : stringValue(value);

    return <div className={className}>{display}</div>;
  },

  wdkLinkCell<Row>({ key, value }: CellProps<Row>): ReactNode {
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

  linkCell<Row>({ key, value }: CellProps<Row>): ReactNode {
    const className = 'Cell LinkCell Cell-' + key;
    const defaults: LinkValue = { href: null, target: '_blank', text: '' };
    let { href, target, text } =
      typeof value === 'object' && value !== null
        ? (value as LinkValue)
        : defaults;
    href = href ? href : typeof value === 'string' ? value : null;
    text = text.length ? text : href ?? '';

    const props = { href, target, className, name: text };

    return href ? <a {...props}>{text}</a> : null;
  },

  htmlCell<Row>({ key, value, column }: CellProps<Row>): ReactNode {
    const { truncated } = column as any;
    const className = 'Cell HtmlCell Cell-' + key;
    const content = (
      <div dangerouslySetInnerHTML={{ __html: value as string }} />
    );
    const size = truncated === true ? '16em' : truncated;

    return truncated ? (
      <OverScroll className={className} size={size}>
        {content}
      </OverScroll>
    ) : (
      <div className={className}>{content}</div>
    );
  },

  heading<Row>({ key, column }: CellProps<Row>): ReactNode {
    const name = column.name;
    const className = 'Cell HeadingCell HeadingCell-' + key;
    const content = <b>{name || key}</b>;

    return <div className={className}>{content}</div>;
  },
};

export default Templates;
