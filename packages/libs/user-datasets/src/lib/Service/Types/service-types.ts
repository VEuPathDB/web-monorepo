// Types that are specific to the VDI service and are not stored as part of a
// dataset's metadata.
import * as io from "io-ts";
import * as dataset from "./metadata-types"

export const partialDatasetType = io.type({
  name: io.string,
  version: io.string,
});

export const userInfo = io.intersection([
  io.type({ userId: io.number }),
  io.partial({
    firstName: io.string,
    lastName: io.string,
    email: io.string,
    affiliation: io.string,
  }),
]);
export type VdiUserInfo = io.TypeOf<typeof userInfo>;

// region Status Types

const importStatusEnum = io.union([
  io.literal("queued"),
  io.literal("in-progress"),
  io.literal("complete"),
  io.literal("invalid"),
  io.literal("failed"),
]);

const installStatusEnum = io.union([
  io.literal("running"),
  io.literal("complete"),
  io.literal("failed-validation"),
  io.literal("failed-installation"),
  io.literal("ready-for-reinstall"),
  io.literal("missing-dependency"),
]);

const installStatusEntry = io.intersection([
  io.type({
    installTarget: io.string,
    metaStatus: installStatusEnum,
  }),
  io.partial({
    metaMessages: io.array(io.string),
    dataStatus: installStatusEnum,
    dataMessages: io.array(io.string),
  }),
]);
export type DatasetInstallStatus = io.TypeOf<typeof installStatusEntry>;

export const datasetStatusInfo = io.intersection([
  io.type({ import: importStatusEnum }),
  io.partial({ install: io.array(installStatusEntry) }),
]);
export type DatasetProcessingStatus = io.TypeOf<typeof datasetStatusInfo>;

// endregion Status Types

// region Share Types

export const shareOfferActionEnum = io.union([
  io.literal("grant"),
  io.literal("revoke"),
]);

export const shareReceiptActionEnum = io.union([
  io.literal("accept"),
  io.literal("reject"),
]);

const shareOfferRecipient = io.intersection([
  io.type({
    userId: io.number,
  }),
  io.partial({
    firstName: io.string,
    lastName: io.string,
    affiliation: io.string,
    email: io.string,
  }),
]);
export type DatasetShareOfferRecipient = io.TypeOf<typeof shareOfferRecipient>;

export const shareOffer = io.type({
  recipient: shareOfferRecipient,
  status: shareOfferActionEnum,
});
export type DatasetShareOffer = io.TypeOf<typeof shareOffer>;

// endregion Share Types

// region Related Datasets

const implicitRelationTypeEnum = io.union([
  io.literal("publication"),
  io.literal("program-name"),
  io.literal("project-name"),
]);

const implicitRelationBase = io.type({ relationType: implicitRelationTypeEnum });

const relationByPublication = io.intersection([
  implicitRelationBase,
  io.type({
    identifier: io.string,
    type: dataset.publicationTypeEnum,
  }),
]);

const implicitRelation = io.union([
  implicitRelationBase,
  relationByPublication,
]);
export type ImplicitRelationDetails = io.TypeOf<typeof implicitRelation>;

export const relatedDataset = io.type({
  datasetId: io.string,
  type: dataset.datasetType,
  name: io.string,
  summary: io.string,
  created: io.string,
  relatedBy: implicitRelation,
});
export type ImplicitlyRelatedDataset = io.TypeOf<typeof relatedDataset>;

// endregion Related Datasets
