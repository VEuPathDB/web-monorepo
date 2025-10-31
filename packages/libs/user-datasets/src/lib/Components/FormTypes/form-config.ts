import { ReactNode } from "react";
import { DatasetDependency, DatasetType, PluginDetails } from "../../Service/Types";
import { transform } from "../../Utils/utils";
import { DatasetInstaller } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { ServiceConfiguration } from "../../Service/Types/service-types";
import {
  BaseDataUpload,
  DataUpload,
  DataUploadKind,
  DataUploadType, MultiDataFileUpload,
  ResultUpload,
  SingleDataFileUpload,
  UrlUpload,
} from "./index";
import { StateField } from "../../Utils/util-types";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";

// region Session Inputs

export interface UrlParams {
  readonly datasetName?: string;
  readonly datasetSummary?: string;
  readonly datasetDescription?: string;
  readonly datasetUrl?: string;
  readonly useFixedUploadMethod?: string;
  readonly datasetStrategyRootStepId?: number;
  readonly datasetStepId?: number;
  readonly datasetStrategyId?: number;
}

// endregion Session Inputs

// region = Data Source Input

// region == Data Input Base

export interface DataInputProps {
  readonly formField: () => ReactNode;
  readonly installer: DatasetInstaller;
  readonly vdiConfig: ServiceConfiguration;
}

type DataInputFactory = (props: DataInputProps) => ReactNode;

export const UploadTypes = {
  File: "file",
  URL: "url",
  Result: "result",
} as const;

export type UploadType = typeof UploadTypes[keyof typeof UploadTypes];

type DataUploadConfigKind<T> = T extends BaseDataUpload<infer K> ? K : never;

interface BaseDataInputConfig<C extends BaseDataUpload<any>> {
  readonly kind: DataUploadKind<C>;

  readonly label: ReactNode;

  readonly installer: DatasetInstaller;

  readonly vdiConfig: ServiceConfiguration;

  readonly fieldState: StateField<DataUpload | undefined>;

  /**
   * Optional function that may be used to wrap or replace the default form
   * field.
   */
  readonly render?: (props: DataInputProps) => ReactNode;

  asKind<R extends DataUploadType>(kind: R): UploadMethodConfig & { kind: typeof kind } | undefined;
}

export type UploadMethodConfig =
  | SingleFileUploadConfig
  | MultiFileUploadConfig
  | UrlUploadConfig
  | ResultUploadConfig;

function asKind<T extends UploadMethodConfig>(self: T): (kind: DataUploadType) => T | undefined {
  return kind => self.kind === kind ? self : undefined;
}

// endregion == Data Input Base

// region == File Input

export type SingleFileUploadConfig = BaseDataInputConfig<SingleDataFileUpload>;

// export function
export function newSingleFileInputConfig(): SingleFileUploadConfig
export function newSingleFileInputConfig(render: DataInputFactory): SingleFileUploadConfig;
export function newSingleFileInputConfig(render?: DataInputFactory): SingleFileUploadConfig {
  return transform(
    { kind: DataUploadType.SingleFile, render } as SingleFileUploadConfig,
    v => ({ ...v, asKind: asKind(v) }),
  ) as SingleFileUploadConfig;
}

export type MultiFileUploadConfig = BaseDataInputConfig<MultiDataFileUpload>;

// endregion == File Input

// region == URL Input

export interface UrlUploadConfig extends BaseDataInputConfig<UrlUpload> {
  readonly inputPlaceholder: string;
  readonly offer: boolean;
}

export function newUrlInputConfig(offer: boolean = false, render?: DataInputFactory): UrlUploadConfig {
  return transform(
    { kind: DataUploadType.URL, offer, render } as UrlUploadConfig,
    v => ({ ...v, asKind: asKind(v) }),
  ) as UrlUploadConfig;
}

// endregion == URL Input

// region == Result Input

type CompatibleRecordTypes = Record<string, { reportName: string; reportConfig: unknown }>;

export interface ResultUploadConfig extends BaseDataInputConfig<ResultUpload> {
  readonly urlParams: UrlParams;
  readonly strategyOptions: StrategySummary[];
  readonly offerStrategyUpload: boolean;
  readonly compatibleRecordTypes: CompatibleRecordTypes;
}

export function newResultInputConfig(
  compatibleRecordTypes: CompatibleRecordTypes,
  offerStrategyUpload: boolean = false,
  render?: DataInputFactory,
): ResultUploadConfig {
  return transform(
    {
      kind: DataUploadType.Result,
      compatibleRecordTypes,
      offerStrategyUpload,
      render,
    } as ResultUploadConfig,
    v => ({ ...v, asKind: asKind(v) }),
  ) as ResultUploadConfig;
}

// endregion == Result Input

// endregion Data Source Input

// region Dependencies

interface DependencyProps {
  readonly value: DatasetDependency[];
  readonly onChange: (value: DatasetDependency[]) => void;
}

export interface DatasetDependenciesConfig {
  readonly label: ReactNode;
  readonly render: (props: DependencyProps) => ReactNode;
}

// endregion Dependencies

// region = Type-Specific Configuration

interface MenuButtonConfig {
  /**
   * Optionally override the data type display name with a new value that may
   * opt to use the dataset type definition for string templating.
   */
  readonly displayNameOverride?: (dt: DatasetType) => string;

  /**
   * Used when rendering the dataset type selection menu.
   */
  readonly description: NonNullable<ReactNode>;
}

export interface UploadFormConfig {
  /**
   * Used as the document title as well as the type-specific upload-form header
   * text.
   *
   * **THIS VALUE IS DATASET TYPE SPECIFIC**
   */
  readonly uploadTitle: string;

  /**
   * Options for rendering menu buttons when multiple dataset types are
   * available for a single project.
   */
  readonly menuConfig: MenuButtonConfig;

  /**
   * Called to generate the help/info text that appears at the bottom of the
   * upload form.
   */
  readonly renderFormFooterInfo?: (configs: UploadMethodConfig[]) => ReactNode;

  readonly installer: PluginDetails;

  readonly dependencies?: DatasetDependenciesConfig;

  readonly uploadMethodConfigs: UploadMethodConfig[];
}


// endregion = Type-Specific Configuration
