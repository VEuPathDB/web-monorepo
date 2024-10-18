import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { safeHtml, wrappable } from '../../../Utils/ComponentUtils';

const containerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  borderLeft: '.2em solid #79a3d7',
  borderRight: '.2em solid #79a3d7',
  padding: '.5em 1em',
  background: '#ebf4ff',
  gap: '1em',
  marginBottom: '1em',
};

function RecordTableDescription(props) {
  const { description } = props.table;
  const [isOverflowing, setIsOverflowing] = useState(undefined);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div style={containerStyle}>
      {safeHtml(
        description,
        {
          ref: (el) => {
            if (el == null || isOverflowing != null) {
              return;
            }
            if (
              el.clientWidth >= el.scrollWidth ||
              el.clientHeight >= el.scrollHeight
            ) {
              setIsOverflowing(false);
            } else {
              setIsOverflowing(true);
            }
          },
          style:
            isExpanded || isOverflowing === false
              ? {}
              : {
                  maxHeight: 'calc(2 * 1.2em)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
        },
        'div'
      )}
      {isOverflowing && (
        <button
          type="button"
          className="link"
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

RecordTableDescription.propTypes = {
  table: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(RecordTableDescription);
