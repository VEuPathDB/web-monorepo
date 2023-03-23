import { Observable, empty } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMapTo,
  tap,
} from 'rxjs/operators';

import { RootState } from '../Core/State/Types';

// Perform a side effect based on state changes
export function stateEffect<K>(
  state$: Observable<RootState>,
  getValue: (state: RootState) => K,
  effect: (value: NonNullable<K>) => void
) {
  return state$.pipe(
    map(getValue),
    filter((value): value is NonNullable<K> => value != null),
    distinctUntilChanged(),
    tap(effect),
    mergeMapTo(empty())
  );
}
