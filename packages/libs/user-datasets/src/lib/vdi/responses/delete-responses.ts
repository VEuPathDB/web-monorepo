import * as io from 'io-ts';
import { ccServerErrorBody, simpleContainerCoreErrorBody } from './shared/error-responses';

export const deleteResponse = io.union([
  io.undefined,
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
]);

export type DatasetDeleteResponse = io.TypeOf<typeof deleteResponse>;
export type DatasetPropertiesDeleteResponse = io.TypeOf<typeof deleteResponse>;
