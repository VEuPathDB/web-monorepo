/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';

/**
 * Visualization object stored in user's session
 */
export type Visualization = t.TypeOf<typeof Visualization>;
export const Visualization = t.type({
  id: t.string,
  appId: t.string,
  type: t.string,
  configuration: t.unknown,
});

/**
 * App object stored in user's session
 */
export type App = t.TypeOf<typeof App>;
export const App = t.type({
  id: t.string,
  type: t.string,
  configuration: t.unknown,
});
