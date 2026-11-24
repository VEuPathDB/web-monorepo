import * as io from 'io-ts';
import { cc401Body, ccServerErrorBody } from './shared/error-responses';

const userMetadata = io.type({
  quota: io.type({
    limit: io.number,
    usage: io.number,
  }),
});

export const getUserMetadataResponse = io.union([
  cc401Body,
  ccServerErrorBody,
  userMetadata,
]);

export type GetUserMetadataResponse = io.TypeOf<typeof getUserMetadataResponse>;
export type VdiUserMetadata = io.TypeOf<typeof userMetadata>;
