import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { safeHtml, wrappable } from '../../../Utils/ComponentUtils';
import { NoteBox } from '@veupathdb/coreui';

function RecordTableDescription(props) {
  const { description } = props.table;
  const [isOverflowing, setIsOverflowing] = useState(undefined);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <NoteBox type="info">
      {safeHtml(
        description,
        {
          ref: (el) => {
            if (el == null || isOverflowing != null) {
              return;
            }
            if (
              el.clientWidth >= el.scrollWidth &&
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
        <>
          <button
            type="button"
            style={{
              border: 'none',
              padding: 0,
              margin: '1ex 0 0 0',
              background: 'transparent',
              color: '#069',
            }}
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        </>
      )}
    </NoteBox>
  );
}

RecordTableDescription.propTypes = {
  table: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(RecordTableDescription);
