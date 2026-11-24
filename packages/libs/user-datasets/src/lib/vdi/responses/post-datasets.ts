import * as io from 'io-ts';
import {
  ccServerErrorBody,
  ccValidationErrorBody,
  simpleContainerCoreErrorBody,
} from './shared/error-responses';

const datasetPostResponseBody = io.type({ datasetId: io.string });

export const datasetPostResponse = io.union([
  datasetPostResponseBody,
  ccValidationErrorBody,
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
]);

export type DatasetPostResponseBody = io.TypeOf<typeof datasetPostResponseBody>;
export type DatasetPutResponseBody = DatasetPostResponseBody;

export type DatasetPostResponse = io.TypeOf<typeof datasetPostResponse>;
export type DatasetPutResponse = DatasetPostResponse;
