import { orderBy, range } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

const NUM_COLS = 80;

function Sequence(props) {
  let { highlightRegions, sequence } = props;

  const sortedHilightRegions = orderBy(highlightRegions, ['start']);
  const firstHighlightRegion = sortedHilightRegions[0];
  // array of react elements
  const highlightedSequence = firstHighlightRegion == null ? [ <React.Fragment>{sequence}</React.Fragment> ]
    : firstHighlightRegion.start === 0 ? []
    : [sequence.slice(0, firstHighlightRegion.start - 1)];

  for (let index = 0; index < sortedHilightRegions.length; index++) {
    const region = highlightRegions[index];
    const nextRegion = highlightRegions[index + 1];
    highlightedSequence.push(region.renderRegion(sequence.slice(region.start - 1, region.end)));
    highlightedSequence.push(sequence.slice(region.end, nextRegion == null ? sequence.length : nextRegion.start - 1));
  }

  // FIXME Trunate and show "Show more" button
  return (
    <pre onCopy={handleCopy} style={{ width: `${NUM_COLS}ch`, whiteSpace: 'break-spaces', wordBreak: 'break-all' }}>
      {highlightedSequence}
    </pre>
  );
}

Sequence.propTypes = {
  /** The sequence to display **/
  sequence: PropTypes.string.isRequired,

  /** Regions to highlight, using 1-based indexing for start and end **/
  highlightRegions: PropTypes.arrayOf(PropTypes.shape({
    renderRegion: PropTypes.func.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired
  }))
};

Sequence.defaultProps = {
  highlightRegions: []
};

function handleCopy(event) {
  const string = window.getSelection().toString();
  const selection = range(Math.ceil(string.length / NUM_COLS))
    .map(n => string.slice(n * NUM_COLS, n * NUM_COLS + NUM_COLS))
    .join('\n');
  event.clipboardData.setData('text/plain', selection);
  event.preventDefault();
}

export default Sequence;
