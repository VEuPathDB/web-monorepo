import * as io from 'io-ts';
import { ccServerErrorBody, ccValidationErrorBody, simpleContainerCoreErrorBody } from './shared/error-responses';

export const datasetPatchResponse = io.union([
  io.undefined, // 204 has no response body
  ccValidationErrorBody,
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
]);

export type DatasetPatchResponse = io.TypeOf<typeof datasetPatchResponse>;
