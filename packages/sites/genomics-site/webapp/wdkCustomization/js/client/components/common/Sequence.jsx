import React from 'react';
import PropTypes from 'prop-types';
import {chunk} from 'lodash';
import {withPlainTextCopy} from 'ebrc-client/util/component';

function Sequence(props) {
  let { highlightRegions, sequence } = props;

  let sequenceChars = highlightRegions.reduce((sequenceChars, highlightRegion) => {
    let { renderRegion, start, end } = highlightRegion;
    return [
      ...sequenceChars.slice(0, start - 1),
      ...sequenceChars.slice(start - 1, end).map(renderRegion),
      ...sequenceChars.slice(end)
    ];
  }, sequence.split(''));

  return (
    <pre>
      {chunk(sequenceChars, 80).map(s => <div>{s}</div>)}
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

export default withPlainTextCopy(Sequence);
