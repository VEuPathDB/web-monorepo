import React from 'react';
import lodash from 'lodash';

export default function Sequence(props) {
  let { highlightRegions, sequence } = props;

  let sequenceChars = highlightRegions.reduce((sequenceChars, highlightRegion) => {
    let { className, start, end } = highlightRegion;
    return [
      ...sequenceChars.slice(0, start - 1),
      ...sequenceChars.slice(start - 1, end).map(c =>
        <span className={className}>{c}</span>
      ),
      ...sequenceChars.slice(end)
    ];
  }, sequence.split(''));

  return (
    <pre>
      {lodash.chunk(sequenceChars, 80).map(s => <div>{s}</div>)}
    </pre>
  );
}

Sequence.propTypes = {
  /** The sequence to display **/
  sequence: React.PropTypes.string.isRequired,

  /** Regions to highlight, using 1-based indexing for start and end **/
  highlightRegions: React.PropTypes.arrayOf(React.PropTypes.shape({
    color: React.PropTypes.string,
    coords: React.PropTypes.shape({
      start: React.PropTypes.number,
      end: React.PropTypes.number
    })
  }))
};

Sequence.defaultProps = {
  highlightRegions: []
};
