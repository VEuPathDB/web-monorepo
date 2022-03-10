// import { useCallback, useState } from 'react';
import { useStorageBackedState } from './StorageBackedState';
import { partial } from 'lodash';

export const useLocalBackedState = partial(useStorageBackedState, window.localStorage)


// type Encoder<T> = (t: T) => string;
// type Parser<T> = (s: string) => T;

// export function useLocalBackedState<T>(
//   defaultValue: T,
//   key: string,
//   encode: Encoder<T>,
//   parse: Parser<T>,
// ): [ T, (newState: T) => void ] {
//   let initialValue = defaultValue;

//     try {
//       const storedStringValue = window.localStorage.getItem(key);

//     if (storedStringValue !== null) {
//       initialValue = parse(storedStringValue);
//     }
//   } catch (e) {
//     console.warn(
//       `Failed attempt to retrieve state value at local key ${key}: ${e}; falling back to component state`
//     );
//   }

//   const [ state, setState ] = useState(initialValue);

//   const setLocalBackedState = useCallback((newValue: T) => {
//     try {
//       window.localStorage.setItem(key, encode(newValue));
//     } catch {
//       console.warn(`Failed attempt to persist state value ${newValue} at local key ${key}; falling back to component state`);
//     }
//     setState(newValue);
//   }, [ encode ]);

//   return [ state, setLocalBackedState ];
// };
