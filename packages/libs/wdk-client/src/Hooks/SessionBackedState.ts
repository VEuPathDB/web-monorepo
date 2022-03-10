// import { useCallback, useState } from 'react';
import { useStorageBackedState } from './StorageBackedState';
import { partial } from 'lodash';

export const useSessionBackedState = partial(useStorageBackedState, window.sessionStorage)

// type Encoder<T> = (t: T) => string;
// type Parser<T> = (s: string) => T;

// export function useSessionBackedState<T>(
//   defaultValue: T,
//   key: string,
//   encode: Encoder<T>,
//   parse: Parser<T>,
// ): [ T, (newState: T) => void ] {
//   let initialValue = defaultValue;

//   try {
//     const storedStringValue = window.sessionStorage.getItem(key);

//     if (storedStringValue !== null) {
//       initialValue = parse(storedStringValue);
//     }
//   } catch (e) {
//     console.warn(
//       `Failed attempt to retrieve state value at session key ${key}: ${e}; falling back to component state`
//     );
//   }

//   const [ state, setState ] = useState(initialValue);

//   const setSessionBackedState = useCallback((newValue: T) => {
//     try {
//       window.sessionStorage.setItem(key, encode(newValue));
//     } catch {
//       console.warn(`Failed attempt to persist state value ${newValue} at session key ${key}; falling back to component state`);
//     }
//     setState(newValue);
//   }, [ encode ]);

//   return [ state, setSessionBackedState ];
// };
