import * as io from 'io-ts';
import { ccServerErrorBody, simpleContainerCoreErrorBody } from './shared/error-responses';
import { datasetTypeOutput } from './shared/shared-fields';

const pluginDataType = io.intersection([
  datasetTypeOutput,
  io.type({
    maxFileSize: io.number,
    usesDataProperties: io.boolean,
    allowedFileExtensions: io.array(io.string),
  }),
]);

const pluginListItem = io.intersection([
  io.type({
    pluginName: io.string,
    dataTypes: io.readonlyArray(pluginDataType),
  }),
  io.partial({
    installTargets: io.readonlyArray(io.string),
  }),
]);

export const getPluginListResponse = io.union([
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
  io.readonlyArray(pluginListItem),
]);

export type PluginDataType = io.TypeOf<typeof pluginDataType>;
export type VdiPluginConfig = io.TypeOf<typeof pluginListItem>;
export type GetPluginListResponse = io.TypeOf<typeof getPluginListResponse>;