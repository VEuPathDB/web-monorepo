import React, { useRef, useState } from 'react';

import { useIsRefOverflowingHorizontally } from '../../Hooks/Overflow';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

import '../../Views/Strategy/OverflowingTextCell.scss';

const cx = makeClassNameHelper('OverflowingTextCell');

export function OverflowingTextCell<T extends string>(props: { value?: T }) {
  const ref = useRef<HTMLDivElement>(null);
  const isOverflowing = useIsRefOverflowingHorizontally(ref);
  const [isExpanded, setExpanded] = useState(false);

  const textContents = props.value || '';
  const htmlContents =
    !isExpanded && isOverflowing
      ? textContents
      : textContents.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));

  const contentsClassName =
    isOverflowing && isExpanded
      ? cx('--OverflowableContents', 'expanded')
      : cx('--OverflowableContents');

  return (
    <div ref={ref} className={contentsClassName}>
      {htmlContents}
      {isOverflowing && (
        <div>
          <button
            type="button"
            className="link"
            onClick={() => {
              setExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        </div>
      )}
    </div>
  );
}
