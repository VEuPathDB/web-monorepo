import * as io from 'io-ts';
import { ccServerErrorBody } from './shared/error-responses';

const vdiApiConfig = io.type({
  maxUploadSize: io.number,
  userMaxStorageSize: io.number,
});

const vdiReconcilerConfig = io.intersection([
  io.type({
    enabled: io.boolean,
    fullRunInterval: io.string,
  }),
  io.record(io.string, io.any),
]);

const vdiDaemonConfig = io.intersection([
  io.type({ reconciler: vdiReconcilerConfig }),
  io.record(io.string, io.any),
]);

const vdiInstallTarget = io.type({
  id: io.string,
  name: io.string,
});

const serviceConfiguration = io.type({
  api: vdiApiConfig,
  daemons: vdiDaemonConfig, // not relevant for public client use
  installTargets: io.readonlyArray(vdiInstallTarget),
});

const serviceFeatures = io.type({
  supportedArchiveTypes: io.readonlyArray(io.string),
});

const serviceMetadata = io.type({
  buildInfo: io.any, // not relevant for public client use
  configuration: serviceConfiguration,
  features: serviceFeatures,
});

export const serviceMetadataResponse = io.union([
  ccServerErrorBody,
  serviceMetadata,
]);

export type VdiApiConfig = io.TypeOf<typeof vdiApiConfig>;
export type VdiReconcilerConfig = io.TypeOf<typeof vdiReconcilerConfig>;
export type VdiServiceConfig = io.TypeOf<typeof serviceConfiguration>;
export type VdiServiceFeatures = io.TypeOf<typeof serviceFeatures>;
export type VdiServiceMetadata = io.TypeOf<typeof serviceMetadata>;
export type GetServiceMetadataResponse = io.TypeOf<typeof serviceMetadataResponse>;