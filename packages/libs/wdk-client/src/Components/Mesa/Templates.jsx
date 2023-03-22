import React from 'react';

import { OptionsDefaults } from 'wdk-client/Components/Mesa/Defaults';
import OverScroll from 'wdk-client/Components/Mesa/Components/OverScroll';
import TruncatedText from 'wdk-client/Components/Mesa/Components/TruncatedText';
import { stringValue } from 'wdk-client/Components/Mesa/Utils/Utils';

const Templates = {
  textCell ({ key, value, row, rowIndex, column }) {
    const { truncated } = column;
    const className = 'Cell Cell-' + key;
    const text = stringValue(value);

    return truncated
      ? <TruncatedText className={className} cutoff={truncated ? OptionsDefaults.overflowHeight : null} text={text} />
      : <div className={className}>{text}</div>
  },

  numberCell ({ key, value, row, rowIndex, column }) {
    const className = 'Cell NumberCell Cell-' + key;
    const display = typeof value === 'number' ? value.toLocaleString() : stringValue(value);

    return <div className={className}>{display}</div>
  },

  wdkLinkCell ({ key, value, row, rowIndex, column }) {
    const className = 'Cell wdkLinkCell Cell-' + key;
    let { displayText, url } = value;
    let href = (url ? url : '#');
    let text = (displayText.length ? value.displayText : href);
    text = (<div dangerouslySetInnerHTML={{ __html: text }} />); 
    let target = '_blank';

    const props = { href, target, className };

    return <a {...props}>{text}</a>
  },

  linkCell ({ key, value, row, rowIndex, column }) {
    const className = 'Cell LinkCell Cell-' + key;
    const defaults = { href: null, target: '_blank', text: '' };
    let { href, target, text } = (typeof value === 'object' ? value : defaults);
    href = (href ? href : (typeof value === 'string' ? value : '#'));
    text = (text.length ? text : href);

    const props = { href, target, className, name: text };

    return <a {...props}>{text}</a>
  },

  htmlCell ({ key, value, row, rowIndex, column }) {
    const { truncated } = column;
    const className = 'Cell HtmlCell Cell-' + key;
    const content = (<div dangerouslySetInnerHTML={{ __html: value }} />);
    const size = (truncated === true ? '16em' : truncated);

    return truncated
      ? <OverScroll className={className} size={size}>{content}</OverScroll>
      : <div className={className}>{content}</div>
  },

  heading ({ key, name }) {
    const className = 'Cell HeadingCell HeadingCell-' + key;
    const content = (<b>{name || key}</b>);

    return (
      <div className={className}>
        {content}
      </div>
    )
  }
};

export default Templates;
