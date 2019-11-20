import React, { useLayoutEffect, useRef, useState } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import 'wdk-client/Views/Strategy/OverflowingTextCell.scss';

const cx = makeClassNameHelper('OverflowingTextCell');

export function OverflowingTextCell<T extends string>(props: { value?: T }) {
  const ref = useRef<HTMLDivElement>(null);
  const isOverflowing = useIsRefOverflowing(ref);
  const [ isExpanded, setExpanded ] = useState(false);

  const textContents = props.value || '';
  const htmlContents = !isExpanded && isOverflowing
    ? textContents
    : textContents.split('\n').map((line, i) => 
        <React.Fragment key={i}>{line}<br /></React.Fragment>
      );

  const contentsClassName = isOverflowing && isExpanded
    ? cx('--OverflowableContents', 'expanded')
    : cx('--OverflowableContents');

  return (
    <div ref={ref} className={contentsClassName}>
      {htmlContents}
      {
        isOverflowing &&
        <div>
          <button type="button" className="link" onClick={() => {
            setExpanded(!isExpanded);
          }}>
            {
              isExpanded ? 'Read Less' : 'Read More'
            }
          </button>
        </div>
      }
    </div>
  );
}

// FIXME This hook has a deficiency - currently, it only updates
// "isOverflowing" when the associated ref is changed - that is,
// upon the mounting of a new DOM element. It would more responsive to update
// "isOverflowing" whenever the size of the ref element changes - 
// one possible way of handling this would be to have this hook employ a
// ResizeObserver. The catch with this approach is that the
// ResizeObserver API is still experimental - maybe this would
// be a good use case for a ponyfill?
function useIsRefOverflowing(ref: React.RefObject<HTMLElement>) {
  const [ isOverflowing, setIsOverflowing ] = React.useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [ ref.current ]);

  return isOverflowing;
}
