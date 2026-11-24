import * as io from 'io-ts';
import { datasetTypeOutput, datasetVisibility, partialUser } from './shared-dataset-fields';
import { datasetStatusInfo } from './shared/status-info';
import { StringArray } from './shared/shared-fields';
import { ccServerErrorBody, simpleContainerCoreErrorBody } from './shared/error-responses';

const datasetListShareUser = io.type({
  userId: io.number,
  firstName: io.string,
  lastName: io.string,
  affiliation: io.string,
  accepted: io.boolean,
});

const datasetListEntry = io.intersection([
  io.type({
    datasetId: io.string,
    owner: partialUser,
    type: datasetTypeOutput,
    visibility: datasetVisibility,
    name: io.string,
    origin: io.string,
    installTargets: StringArray,
    status: datasetStatusInfo,
    fileCount: io.number,
    fileSizeTotal: io.number,
    created: io.string,
    summary: io.string,
  }),
  io.partial({
    shares: io.readonlyArray(datasetListShareUser),
    description: io.string,
    originalId: io.string,
  }),
]);

export type DatasetListShareUser = io.TypeOf<typeof datasetListShareUser>;
export type DatasetListEntry = io.TypeOf<typeof datasetListEntry>;

export const getDatasetListResponse = io.union([
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
  io.readonlyArray(datasetListEntry),
]);
export type GetDatasetListResponse = io.TypeOf<typeof getDatasetListResponse>;

