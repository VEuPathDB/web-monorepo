/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';

/**
 * Visualization object stored in user's session
 */
export type Visualization = t.TypeOf<typeof Visualization>;
export const Visualization = t.type({
  id: t.string,
  computationId: t.string,
  type: t.string,
  displayName: t.string,
  configuration: t.unknown,
});

/**
 * App object stored in user's session
 */
export type Computation = t.TypeOf<typeof Computation>;
export const Computation = t.type({
  id: t.string,
  type: t.string,
  displayName: t.string,
  configuration: t.unknown,
});
