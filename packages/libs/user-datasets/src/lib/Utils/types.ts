import React, { ReactNode } from 'react';

import {
  TypeOf,
  array,
  intersection,
  number,
  type,
  partial,
  string,
} from 'io-ts';
import { DatasetDependency } from "../Service/model/response-decoders";

export type Consumer<T> = (value: T) => void;
export type BiConsumer<T1, T2> = (value1: T1, value2: T2) => void;

export type ArrayElement<A extends any[]> = A extends (infer V)[] ? V : never;

////////////////////////////////////////////////////////////////////////////////

export interface UserDatasetUpload {
  id: string;
  datasetId?: number;
  datasetName: string;
  summary?: string;
  description?: string;
  projects: string[];
  status: string;
  errors: string[];
  stepPercent?: number;
  started: string;
  finished?: string;
  isOngoing: boolean;
  isCancellable: boolean;
  isSuccessful: boolean;
  isUserError: boolean;
}

export type DatasetUploadTypeConfig<T extends string> = {
  [K in T]: DatasetUploadTypeConfigEntry<K>;
};

export interface DatasetUploadTypeConfigEntry<T extends string> {
  type: T;
  displayName: string;
  description: React.ReactNode;
  uploadTitle: string;
  formConfig: {
    name?: {
      inputProps: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
    };
    summary?: {
      inputProps: Partial<React.InputHTMLAttributes<HTMLTextAreaElement>>;
    };
    description?: {
      inputProps: Partial<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
    };
    dependencies?: {
      label: ReactNode;
      render: (props: DependencyProps) => ReactNode;
      required?: boolean;
    };
    hideRelatedOrganisms?: boolean;
    uploadMethodConfig: {
      file?: FileUploadConfig;
      url?: UrlUploadConfig;
      result?: ResultUploadConfig;
    };
    renderInfo?: () => ReactNode;
  };
}

export interface DependencyProps {
  value: DatasetDependency[];
  onChange: (value: DatasetDependency[]) => void;
}

export interface FileUploadConfig {
  render?: (props: { fieldNode: ReactNode }) => ReactNode;
  maxSizeBytes?: number;
}

export interface UrlUploadConfig {
  offer: boolean;
}

export interface ResultUploadConfig {
  offerStrategyUpload: boolean;
  compatibleRecordTypes: CompatibleRecordTypes;
}

export type CompatibleRecordTypes = Record<
  string,
  { reportName: string; reportConfig: unknown }
>;
/**
 * In EDA, data is referred to as "Study" or "Studies"
 * In genomics, data is referred to as "Dataset" or "Datasets"
 */
export type DataNoun = {
  singular: string;
  plural: string;
};

export type UserDatasetFormContent = TypeOf<typeof userDatasetFormContent>;
export const userDatasetFormContent = intersection([
  type({
    name: string,
    summary: string,
  }),
  partial({
    shortAttribution: string,
    description: string,
  }),
]);
partial({
  upload: type({
    zipSize: number,
    contents: array(type({ fileName: string, fileSize: number })),
  }),
  install: type({
    zipSize: number,
    contents: array(type({ fileName: string, fileSize: number })),
  }),
});
// export async function getEnabledTypeConfigs(
//   projectId: string,
//   serviceUrl: string,
//   allConfigs: Record<string, ClientDataTypeConfig>
// ): Promise<Map<string, DatasetTypeConfig>> {
//   const plugins = await getEnabledPlugins(projectId, serviceUrl);
//   const output = new Map<string, DatasetTypeConfig>();
//
//   for (const plugin of plugins) {
//     // Some plugins are restricted to specific target projects.  If the current
//     // plugin lists project restrictions, ensure that the given projectId value
//     // appears within the restriction list.
//     if (plugin.installTargets && plugin.installTargets.length > 0) {
//       if (!plugin.installTargets.includes(projectId)) continue;
//     }
//
//     for (const pDataType of plugin.dataTypes) {
//       if (!Object.hasOwn(allConfigs, pDataType.name)) continue;
//
//       output.set(pDataType.name, {
//         ...allConfigs[pDataType.name]!,
//         vdiConfig: pDataType,
//         vdiPlugin: plugin,
//       });
//     }
//   }
//
//   return output;
// }
//
// export async function getEnabledPlugins(
//   targetProject: string,
//   serviceUrl: string
// ): Promise<Array<PluginListItem>> {
//   return new BasicVdiService({ baseUrl: serviceUrl }).getPluginList(
//     targetProject
//   );
// }
//
