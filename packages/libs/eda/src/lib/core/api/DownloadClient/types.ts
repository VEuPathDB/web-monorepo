/* eslint-disable @typescript-eslint/no-redeclare */

import { array, string, type, TypeOf } from 'io-ts';

export const ReleasesResponse = array(string);
export type ReleasesResponse = TypeOf<typeof ReleasesResponse>;

export const ReleaseFilesResponse = array(
  type({ name: string, modifiedDate: string, size: string })
);
export type ReleaseFilesResponse = TypeOf<typeof ReleaseFilesResponse>;
