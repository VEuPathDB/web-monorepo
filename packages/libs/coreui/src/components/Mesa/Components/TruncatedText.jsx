import React from 'react';

import Icon from './Icon';

class TruncatedText extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  wordCount(text) {
    if (typeof text !== 'string') return undefined;
    return text
      .trim()
      .split(' ')
      .filter((x) => x.length).length;
  }

  reverseText(text) {
    if (typeof text !== 'string' || !text.length) return text;
    return text.split('').reverse().join('');
  }

  trimInitialPunctuation(text) {
    if (typeof text !== 'string' || !text.length) return text;
    while (text.search(/[a-zA-Z0-9]/) !== 0) {
      text = text.substring(1);
    }
    return text;
  }

  trimPunctuation(text) {
    if (typeof text !== 'string' || !text.length) return text;

    text = this.trimInitialPunctuation(text);
    text = this.reverseText(text);
    text = this.trimInitialPunctuation(text);
    text = this.reverseText(text);

    return text;
  }

  truncate(text, cutoff) {
    if (typeof text !== 'string' || typeof cutoff !== 'number') return text;
    let count = this.wordCount(text);
    if (count < cutoff) return text;

    let words = text
      .trim()
      .split(' ')
      .filter((x) => x.length);
    let threshold = Math.ceil(cutoff * 0.66);
    let short = words.slice(0, threshold).join(' ');

    return this.trimPunctuation(short) + '...';
  }

  toggleExpansion() {
    let { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  render() {
    let { expanded } = this.state;
    let { className, cutoff, text } = this.props;
    cutoff = typeof cutoff === 'number' ? cutoff : 100;
    let expandable = this.wordCount(text) > cutoff;

    className = 'TruncatedText' + (className ? ' ' + className : '');
    text = expanded ? text : this.truncate(text, cutoff);

    return (
      <div className={className}>
        {text}
        {expandable && (
          <button
            className="TruncatedText-Toggle"
            onClick={this.toggleExpansion}
          >
            {expanded ? 'Show Less' : 'Show More'}
            <Icon fa={expanded ? 'angle-double-up' : 'angle-double-down'} />
          </button>
        )}
      </div>
    );
  }
}

export default TruncatedText;
