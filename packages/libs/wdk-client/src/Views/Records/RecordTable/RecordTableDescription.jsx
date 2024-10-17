import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { safeHtml, wrappable } from '../../../Utils/ComponentUtils';

function RecordTableDescription(props) {
  const { description } = props.table;
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 1em' }}>
      {safeHtml(
        description,
        {
          ref: (el) => {
            if (
              el == null ||
              el.clientWidth >= el.scrollWidth ||
              el.clientHeight >= el.scrollHeight
            )
              return;
            setIsOverflowing(true);
          },
          style: isExpanded
            ? { width: '100%' }
            : {
                maxWidth: '50%',
                maxHeight: '1.2em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
        },
        'p'
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
