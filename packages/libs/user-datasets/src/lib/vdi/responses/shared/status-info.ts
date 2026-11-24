import * as io from 'io-ts';

const datasetImportStatus = io.union([
  io.literal('queued'),
  io.literal('in-progress'),
  io.literal('complete'),
  io.literal('invalid'),
  io.literal('failed'),
]);
export type ImportStatusCode = io.TypeOf<typeof datasetImportStatus>;

const datasetImportStatusDetails = io.intersection([
  io.type({ status: datasetImportStatus }),
  io.partial({ messages: io.array(io.string) }),
]);
export type ImportStatusInfo = io.TypeOf<
  typeof datasetImportStatusDetails
>;

const datasetInstallStatus = io.union([
  io.literal('running'),
  io.literal('complete'),
  io.literal('failed-validation'),
  io.literal('failed-installation'),
  io.literal('ready-for-reinstall'),
  io.literal('missing-dependency'),
]);
export type InstallStatusCode = io.TypeOf<typeof datasetInstallStatus>;

const datasetInstallStatusEntry = io.intersection([
  io.type({ status: datasetInstallStatus }),
  io.partial({ messages: io.array(io.string) }),
]);
export type InstallStatusEntry = io.TypeOf<
  typeof datasetInstallStatusEntry
>;

const datasetInstallStatusMap = io.intersection([
  io.type({
    installTarget: io.string,
    meta: datasetInstallStatusEntry,
  }),
  io.partial({ data: datasetInstallStatusEntry }),
]);
export type InstallStatusInfo = io.TypeOf<
  typeof datasetInstallStatusMap
>;

const datasetUploadStatusCode = io.union([
  io.literal('running'),
  io.literal('success'),
  io.literal('rejected'),
  io.literal('failed'),
]);
export type UploadStatusCode = io.TypeOf<typeof datasetUploadStatusCode>;

const datasetUploadStatusInfo = io.intersection([
  io.type({ status: datasetUploadStatusCode }),
  io.partial({ message: io.string }),
]);
export type UploadStatusInfo = io.TypeOf<typeof datasetUploadStatusInfo>;

export const datasetStatusInfo = io.intersection([
  io.type({ upload: datasetUploadStatusInfo }),
  io.partial({
    import: datasetImportStatusDetails,
    install: io.readonlyArray(datasetInstallStatusMap),
  }),
]);
export type StatusInfo = io.TypeOf<typeof datasetStatusInfo>;
