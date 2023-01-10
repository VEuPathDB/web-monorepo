import { orderBy, range } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useIsRefOverflowingVertically } from '@veupathdb/wdk-client/lib/Hooks/Overflow';
import { writeTextToClipboard } from '@veupathdb/wdk-client/lib/Utils/DomUtils';

const NUM_COLS = 80;

interface Props {
  accession?: string;
  highlightRegions?: HighlightRegion[];
  sequence: string;
}

interface HighlightRegion {
  start: number;
  end: number;
  renderRegion: (region: string) => React.ReactNode;
}

function Sequence(props: Props) {
  const { accession, highlightRegions = [], sequence } = props;
  const ref = useRef<HTMLPreElement>(null);
  const [ isExpanded, setIsExpanded ] = useState<boolean>();
  const isOverflowing = useIsRefOverflowingVertically(ref);

  const onClickCopyButton = useCallback(
    () => {
      if (ref.current) {
        const sequenceLines = makeSequenceLines(ref.current.textContent ?? '');

        const newClipboardLines = accession == null
          ? sequenceLines
          : [ makeDefline(accession), ...sequenceLines ]

        const newClipboardText = newClipboardLines
          .flatMap(newClipboardLine => [ newClipboardLine, '\n' ])
          .join('');

        writeTextToClipboard(newClipboardText);
      }
    },
    [ accession, ref.current ]
  );

  useEffect(() => {
    if (ref.current == null || isExpanded == null || isExpanded) return;
    ref.current.scrollIntoView({ block: 'center' });
  }, [ ref.current, isExpanded ]);

  const style = {
    width: `${NUM_COLS + 0.5}ch`,
    whiteSpace: 'break-spaces',
    wordBreak: 'break-all',
    maxHeight: isExpanded ? '' : '30vh',
    overflow: 'hidden'
  } as const;

  const sortedHilightRegions = orderBy(highlightRegions, ['start']);
  const firstHighlightRegion = sortedHilightRegions[0];
  const highlightedSequence: React.ReactNode[] = firstHighlightRegion == null ? [ sequence ]
    : firstHighlightRegion.start === 0 ? []
    : [sequence.slice(0, firstHighlightRegion.start - 1)];

  for (let index = 0; index < sortedHilightRegions.length; index++) {
    const region = highlightRegions[index];
    const nextRegion = highlightRegions[index + 1];
    highlightedSequence.push(region.renderRegion(sequence.slice(region.start - 1, region.end)));
    highlightedSequence.push(sequence.slice(region.end, nextRegion == null ? sequence.length : nextRegion.start - 1));
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        fontSize: '.9em',
        top: '-3em',
        right: 0,
      }}>
        <button type="button" onClick={onClickCopyButton}>Copy to clipboard</button>
      </div>
      <pre ref={ref} onCopy={handleCopy} style={style}>
        {highlightedSequence.map((frag, index) => <React.Fragment key={index}>{frag}</React.Fragment>)}
      </pre>
      {isOverflowing && (
        <div style={{
          position: isExpanded ? 'sticky' : 'absolute',
          bottom: 0,
          width: '100%',
          paddingTop: '2em',
          paddingBottom: isExpanded ? '2em' : undefined,
          background: 'linear-gradient(to bottom, transparent, white 50%)',
          fontWeight: 500
        }}>
          <button type="button" className="link" onClick={() => {
            setIsExpanded(!isExpanded);
          }}>
            <i className={`fa fa-chevron-${isExpanded ? 'up' : 'down'}`}/> {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
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

function handleCopy(event: React.ClipboardEvent) {
  const string = window.getSelection()?.toString() ?? '';
  const selection = makeSequenceLines(string).join('\n');
  event.clipboardData.setData('text/plain', selection);
  event.preventDefault();
}

function makeDefline(accession: string) {
  return `>${accession}`;
}

function makeSequenceLines(sequenceSegment: string) {
  return (
    range(Math.ceil(sequenceSegment.length / NUM_COLS))
      .map(n => sequenceSegment.slice(n * NUM_COLS, n * NUM_COLS + NUM_COLS))
  );
}

export default Sequence;
