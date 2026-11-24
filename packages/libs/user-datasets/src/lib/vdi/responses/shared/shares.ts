import * as io from 'io-ts';
import { datasetTypeOutput, partialUser } from '../shared-dataset-fields';
import { StringArray } from './shared-fields';

const shareOfferStatus = io.union([
  io.literal('open'),
  io.literal('accepted'),
  io.literal('rejected'),
]);
export const shareOfferListEntry = io.type({
  datasetId: io.string,
  owner: partialUser,
  shareStatus: shareOfferStatus,
  type: datasetTypeOutput,
  installTargets: StringArray,
});
export type ShareOfferListEntry = io.TypeOf<typeof shareOfferListEntry>;

const shareOfferAction = io.union([io.literal('grant'), io.literal('revoke')]);
export type ShareOfferAction = io.TypeOf<typeof shareOfferAction>;

export const shareOffer = io.type({
  recipient: partialUser,
  status: shareOfferAction,
});
export type ShareOffer = io.TypeOf<typeof shareOffer>;
