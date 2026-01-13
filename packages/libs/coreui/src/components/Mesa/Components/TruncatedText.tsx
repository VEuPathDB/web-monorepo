import React from 'react';

import Icon from './Icon';

interface TruncatedTextProps {
  className?: string;
  cutoff?: number;
  text: string;
}

interface TruncatedTextState {
  expanded: boolean;
}

class TruncatedText extends React.Component<
  TruncatedTextProps,
  TruncatedTextState
> {
  constructor(props: TruncatedTextProps) {
    super(props);
    this.state = { expanded: false };
    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  wordCount(text: string): number | undefined {
    if (typeof text !== 'string') return undefined;
    return text
      .trim()
      .split(' ')
      .filter((x) => x.length).length;
  }

  reverseText(text: string): string {
    if (typeof text !== 'string' || !text.length) return text;
    return text.split('').reverse().join('');
  }

  trimInitialPunctuation(text: string): string {
    if (typeof text !== 'string' || !text.length) return text;
    while (text.search(/[a-zA-Z0-9]/) !== 0) {
      text = text.substring(1);
    }
    return text;
  }

  trimPunctuation(text: string): string {
    if (typeof text !== 'string' || !text.length) return text;

    text = this.trimInitialPunctuation(text);
    text = this.reverseText(text);
    text = this.trimInitialPunctuation(text);
    text = this.reverseText(text);

    return text;
  }

  truncate(text: string, cutoff: number): string {
    if (typeof text !== 'string' || typeof cutoff !== 'number') return text;
    const count = this.wordCount(text);
    if (count !== undefined && count < cutoff) return text;

    const words = text
      .trim()
      .split(' ')
      .filter((x) => x.length);
    const threshold = Math.ceil(cutoff * 0.66);
    const short = words.slice(0, threshold).join(' ');

    return this.trimPunctuation(short) + '...';
  }

  toggleExpansion(): void {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  render() {
    const { expanded } = this.state;
    let className = this.props.className;
    let cutoff = this.props.cutoff;
    let text = this.props.text;
    cutoff = typeof cutoff === 'number' ? cutoff : 100;
    const expandable = (this.wordCount(text) ?? 0) > cutoff;

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
