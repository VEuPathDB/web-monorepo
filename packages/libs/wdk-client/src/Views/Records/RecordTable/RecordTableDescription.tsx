import React, { useState } from 'react';
import { safeHtml, wrappable } from '../../../Utils/ComponentUtils';
import {
  RecordClass,
  RecordInstance,
  TableField,
} from '../../../Utils/WdkModel';

interface RecordTableDescriptionProps {
  table: TableField;
  record: RecordInstance;
  recordClass: RecordClass;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  borderLeft: '.2em solid #79a3d7',
  borderRight: '.2em solid #79a3d7',
  padding: '.5em 1em',
  background: '#ebf4ff',
  gap: '1em',
  marginBottom: '1em',
};

function RecordTableDescription(props: RecordTableDescriptionProps) {
  const { description } = props.table;
  const [isOverflowing, setIsOverflowing] =
    useState<boolean | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!description) return null;

  return (
    <div style={containerStyle}>
      {safeHtml(
        description,
        {
          ref: (el: HTMLDivElement | null) => {
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

export default wrappable(RecordTableDescription);
