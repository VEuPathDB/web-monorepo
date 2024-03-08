import React from 'react';

import { OptionsDefaults } from './Defaults';
import OverScroll from './Components/OverScroll';
import TruncatedText from './Components/TruncatedText';
import { stringValue } from './Utils/Utils';

const Templates = {
  textText({ value }) {
    return stringValue(value);
  },

  textCell({ key, value, row, rowIndex, column }) {
    const { truncated } = column;
    const className = 'Cell Cell-' + key;
    const text = Templates.textText({ value });

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

  numberText({ value }) {
    return typeof value === 'number'
      ? value.toLocaleString()
      : stringValue(value);
  },

  numberCell({ key, value, row, rowIndex, column }) {
    const className = 'Cell NumberCell Cell-' + key;
    const display = Templates.numberText({ value });
    return <div className={className}>{display}</div>;
  },

  wdkLinkText({ value, href }) {
    const { displayText, url } = value;
    return displayText.length ? value.displayText : href;
  },

  wdkLinkCell({ key, value, row, rowIndex, column }) {
    const className = 'Cell wdkLinkCell Cell-' + key;
    const { url } = value;
    const href = url ? url : '#';
    const text = Templates.wdkLinkText({ value, href });
    const div = <div dangerouslySetInnerHTML={{ __html: text }} />;
    const target = '_blank';
    const props = { href, target, className };

    return <a {...props}>{div}</a>;
  },

  linkText({ value }) {
    const { text } = getLinkDetails(value);
    return text;
  },

  linkCell({ key, value, row, rowIndex, column }) {
    const className = 'Cell LinkCell Cell-' + key;
    const { href, text, target } = getLinkDetails(value);
    const props = { href, target, className, name: text };
    return <a {...props}>{text}</a>;
  },

  htmlCell({ key, value, row, rowIndex, column }) {
    const { truncated } = column;
    const className = 'Cell HtmlCell Cell-' + key;
    const content = <div dangerouslySetInnerHTML={{ __html: value }} />;
    const size = truncated === true ? '16em' : truncated;

    return truncated ? (
      <OverScroll className={className} size={size}>
        {content}
      </OverScroll>
    ) : (
      <div className={className}>{content}</div>
    );
  },

  heading({ key, name }) {
    const className = 'Cell HeadingCell HeadingCell-' + key;
    const content = <b>{name || key}</b>;

    return <div className={className}>{content}</div>;
  },
};

function getLinkDetails(value) {
  const defaults = { href: '#', text: '', target: '_blank' };
  if (typeof value === 'string') {
    // If the value is a string, it's used for both href and text, with default target
    return { ...defaults, href: value, text: value };
  } else if (typeof value === 'object' && value != null) {
    // If the value is an object, extract href, text, and target, applying defaults as necessary
    const { href = '#', text = '', target = '_blank' } = value;
    return { href, text: text.length > 0 ? text : href, target };
  }
  return defaults;
}

export default Templates;
