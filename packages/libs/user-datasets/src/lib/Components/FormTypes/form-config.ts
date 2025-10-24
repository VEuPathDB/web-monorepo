import { ReactNode } from "react";
import { DatasetDependency, DatasetType, PluginDetails } from "../../Service/Types";
import { transform } from "../../Utils/utils";
import { DatasetInstaller } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { ServiceConfiguration } from "../../Service/Types/service-types";

// region = Data Source Input

// region == Data Input Base

export interface DataInputProps {
  readonly formField: ReactNode;
  readonly installer: DatasetInstaller;
  readonly vdiConfig: ServiceConfiguration;
}

type DataInputFactory = (props: DataInputProps) => ReactNode;

export type DataInputKind = "file" | "url" | "result";

interface BaseDataInputConfig<T extends DataInputKind> {
  readonly kind: T;

  readonly render?: (props?: DataInputProps) => ReactNode;

  asKind<R extends DataInputKind = T>(kind: R): (DataInputConfig & BaseDataInputConfig<R>) | undefined;
}

export type DataInputConfig = FileInputConfig | UrlInputConfig | ResultInputConfig;

function asKind<
  R extends DataInputKind,
  T extends BaseDataInputConfig<R>
>(self: T): (kind: DataInputKind) => T | undefined {
  return kind => self.kind === kind ? self : undefined;
}

// endregion == Data Input Base

// region == File Input

export interface FileInputConfig extends BaseDataInputConfig<"file"> {
  readonly kind: "file";
  readonly maxSizeBytes: number;
  readonly allowedExtensions: string[];
}

// export function
export function newFileInputConfig(): FileInputConfig
export function newFileInputConfig(render: DataInputFactory): FileInputConfig;
export function newFileInputConfig(render?: DataInputFactory): FileInputConfig {
  return transform(
    {
      kind: "file",
      render
    } as FileInputConfig,
    v => ({ ...v, asKind: asKind(v) }),
  ) as FileInputConfig;
}

// endregion == File Input

// region == URL Input

interface UrlInputConfig extends BaseDataInputConfig<"url"> {
  readonly kind: "url";
  readonly offer: boolean;
}

export function newUrlInputConfig(offer: boolean = false, render?: DataInputFactory): UrlInputConfig {
  return transform(
    { kind: "url", offer, render } as UrlInputConfig,
    v => ({ ...v, asKind: asKind(v) }),
  ) as UrlInputConfig;
}

// endregion == URL Input

// region == Result Input

type CompatibleRecordTypes = Record<string, { reportName: string; reportConfig: unknown }>;

interface ResultInputConfig extends BaseDataInputConfig<"result"> {
  readonly kind: "result";
  readonly offerStrategyUpload: boolean;
  readonly compatibleRecordTypes: CompatibleRecordTypes;
}

export function newResultInputConfig(
  compatibleRecordTypes: CompatibleRecordTypes,
  offerStrategyUpload: boolean = false,
  render?: DataInputFactory,
): ResultInputConfig {
  return transform(
    {
      kind: "result",
      compatibleRecordTypes,
      offerStrategyUpload,
      render,
    } as ResultInputConfig,
    v => ({ ...v, asKind: asKind(v) }),
  ) as ResultInputConfig;
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

// region Common Field Overrides

export interface VariableDisplayText {
  readonly detailsPageTitle: string;
  readonly workspaceTitle: string;
  readonly datasetNounSingular: string;
  readonly datasetNounPlural: string;
  readonly datasetNameLabel: NonNullable<ReactNode>;
  readonly summaryPlaceholder: string;
}

// endregion Common Field Overrides

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
  readonly renderFormFooterInfo?: (configs: DataInputConfig[]) => ReactNode;

  readonly installer: PluginDetails;

  readonly dependencies?: DatasetDependenciesConfig;

  readonly uploadMethodConfigs: DataInputConfig[];

}

// endregion = Type-Specific Configuration
