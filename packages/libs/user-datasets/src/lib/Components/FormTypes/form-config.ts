import { ReactNode } from "react";
import { DatasetDependency } from "../../Service/Types";

// region Data Source Input

type DataInputKind = "file" | "url" | "result";

interface DataInputProps {
  readonly formField: ReactNode;
}

interface DataInputConfig {
  readonly kind: DataInputKind;

  readonly render?: (props: DataInputProps) => ReactNode;
}

interface FileInputConfig extends DataInputConfig {
  readonly kind: "file";
  readonly maxSizeBytes?: number;
}

interface UrlInputConfig extends DataInputConfig {
  readonly kind: "url";
  readonly offer: boolean;
}

type CompatibleRecordTypes = Record<string, { reportName: string; reportConfig: unknown }>;

interface ResultInputConfig extends DataInputConfig {
  readonly kind: "result";
  readonly offerStrategyUpload: boolean;
  readonly compatibleRecordTypes: CompatibleRecordTypes;
}

export type DataInputConfigUnion = FileInputConfig | UrlInputConfig | ResultInputConfig;

// endregion Data Source Input

// region Dependencies

interface DependencyProps {
  readonly value: DatasetDependency;
  readonly onChange: (value: DatasetDependency) => void;
}

export interface DatasetDependenciesConfig {
  readonly label: ReactNode;
  readonly render: (props: DependencyProps) => ReactNode;
}

// endregion Dependencies

// region Common Field Overrides

export interface VariableFieldLabels {
  readonly datasetName: string;
}

// endregion Common Field Overrides

export interface DatasetUploadFormConfig {
  readonly labelOverrides: VariableFieldLabels;
  readonly uploads: DataInputConfigUnion;
  readonly dependencies: DatasetDependenciesConfig;
}
