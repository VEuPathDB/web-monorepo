import React, { useLayoutEffect, useState } from 'react';
import { partial } from 'lodash';

// FIXME This hook has a deficiency - currently, it only updates
// "isOverflowing" when the associated ref is changed - that is,
// upon the mounting of a new DOM element. It would more responsive to update
// "isOverflowing" whenever the size of the ref element changes - 
// one possible way of handling this would be to have this hook employ a
// ResizeObserver. The catch with this approach is that the
// ResizeObserver API is still experimental - maybe this would
// be a good use case for a ponyfill?
export function useIsRefOverflowing<T extends HTMLElement>(
  isElementOverflowing: (elem: T) => boolean, 
  ref: React.RefObject<T>
) {
  const [ isOverflowing, setIsOverflowing ] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      setIsOverflowing(isElementOverflowing(ref.current));
    }
  }, [ ref.current ]);

  return isOverflowing;
}

export const useIsRefOverflowingHorizontally = partial(useIsRefOverflowing, elem => elem.scrollWidth > elem.clientWidth);
export const useIsRefOverflowingVertically = partial(useIsRefOverflowing, elem => elem.scrollHeight > elem.clientHeight);
