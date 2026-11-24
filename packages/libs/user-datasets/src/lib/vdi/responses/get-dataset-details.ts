import * as io from 'io-ts';
import { datasetFileListing } from './shared/dataset-files';
import { datasetStatusInfo } from './shared/status-info';
import { shareOffer } from './shared/shares';
import { datasetPublicationType } from './shared/publications';
import { datasetMetaBase } from './shared/dataset-meta-base';
import { ccServerErrorBody, simpleContainerCoreErrorBody } from './shared/error-responses';
import { datasetTypeOutput, datasetVisibility, partialUser } from './shared/shared-fields';

const datasetMetadataContentFlags = io.partial({
  hasDatasetCharacteristics: io.boolean,
  hasDataDisclaimer: io.boolean,
  hasDatasetSources: io.boolean,
  hasOrganismData: io.boolean,
  hasPublications: io.boolean,
});

const datasetRelation = io.union([
  io.type({
    relationType: io.literal('publication'),
    identifier: io.string,
    type: datasetPublicationType,
  }),

  io.type({
    relationType: io.union([
      io.literal('program-name'),
      io.literal('project-name'),
    ]),
  }),
]);

const relatedDatasetInfo = io.type({
  datasetId: io.string,
  type: datasetTypeOutput,
  name: io.string,
  summary: io.string,
  created: io.string,
  relatedBy: datasetRelation,
});

const datasetRevisionAction = io.union([
  io.literal('create'),
  io.literal('extend'),
  io.literal('revise'),
]);

const datasetRevision = io.type({
  action: datasetRevisionAction,
  timestamp: io.string,
  revisionId: io.string,
  revisionNote: io.string,
  fileListUrl: io.string,
});

const revisionHistory = io.type({
  originalId: io.string,
  revisions: io.readonlyArray(datasetRevision),
});

const datasetDetails = io.intersection([
  datasetMetaBase,
  io.type({
    datasetId: io.string,
    type: datasetTypeOutput,
    visibility: datasetVisibility,
    owner: partialUser,
    created: io.string,
    shortName: io.string,
    status: datasetStatusInfo,
    files: datasetFileListing,
    metadataContentFlags: datasetMetadataContentFlags,
  }),
  io.partial({
    sourceUrl: io.string,
    revisionHistory: revisionHistory,
    relatedDatasets: io.readonlyArray(relatedDatasetInfo),
    shares: io.readonlyArray(shareOffer),
  }),
]);

export const datasetGetResponse = io.union([
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
  datasetDetails,
]);

export type DatasetMetadataContentFlags = io.TypeOf<typeof datasetMetadataContentFlags>;
export type DatasetDetails = io.TypeOf<typeof datasetDetails>;
export type GetDatasetResponse = io.TypeOf<typeof datasetGetResponse>;
