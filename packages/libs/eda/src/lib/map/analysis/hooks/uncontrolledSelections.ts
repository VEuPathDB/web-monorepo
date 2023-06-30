import { useState } from 'react';

/**
 * This hook is used to sync up the uncontrolled selections that are set synchronously with categorical overlayValues
 * that are set asynchronously. Instead of using a useEffect, we can use an internal previousOverlays state and compare
 * it to the overlayValues prop. Implementation is inspired by the "Better" example from this section of React's
 * docs: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 *
 * @param overlayValues Only categorical overlayValues should be passed in, otherwise pass in undefined
 * @returns A Set of string overlayValues and a setter function
 */

export function useUncontrolledSelections(overlayValues: string[] | undefined) {
  const [uncontrolledSelections, setUncontrolledSelections] = useState(
    new Set(overlayValues)
  );

  const [previousOverlays, setPreviousOverlays] = useState(overlayValues);
  if (previousOverlays !== overlayValues) {
    setUncontrolledSelections(new Set(overlayValues));
    setPreviousOverlays(overlayValues);
  }

  return {
    uncontrolledSelections,
    setUncontrolledSelections,
  };
}
