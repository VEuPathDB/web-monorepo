import {
  Dispatch,
  SetStateAction,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';

export const useCoreUIFonts = () =>
  useEffect(() => {
    const linkOne = document.createElement('link');
    linkOne.setAttribute('href', 'https://fonts.googleapis.com');
    linkOne.setAttribute('rel', 'preconnect');

    const linkTwo = document.createElement('link');
    linkTwo.setAttribute('href', 'https://fonts.gstatic.com');
    linkTwo.setAttribute('rel', 'preconnect');
    linkTwo.setAttribute('crossorigin', 'true');

    const linkThree = document.createElement('link');
    linkThree.setAttribute(
      'href',
      'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
    );

    linkThree.setAttribute('rel', 'stylesheet');
    document.head.appendChild(linkThree);
  }, []);

// This hook functions similarly to `useState`, but with the added benefit
// of deferring updates to the state value. The primary state value (first element in the
// returned array) is 'deferred', meaning that updates to this value are handled as low-priority
// and can be interrupted if the state changes rapidly, preventing unnecessary re-renders.
// This is particularly useful for expensive renders or non-urgent updates.
//
// The third return value represents the 'raw' or 'volatile' state, which reflects
// the immediate state changes and should be used in UI elements that require responsive updates
// (e.g., form inputs, user feedback). You can ignore this value if not needed, making it
// a drop-in replacement for `useState`.
//
// Usage:
// const [deferredState, setState, volatileState] = useDeferredState(initialValue);
// - `deferredState`: Use for non-urgent rendering, allowing the UI to remain responsive.
// - `setState`: The state setter function, as in `useState`.
// - `volatileState`: Use when immediate, responsive updates are needed, such as in user interactions.
export function useDeferredState<T>(
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, T] {
  const [volatileState, setState] = useState(initialValue);
  const deferredState = useDeferredValue(volatileState);

  return [deferredState, setState, volatileState];
}
