import * as api from "../../Service/Types";
import { CompatibleRecordTypes } from "../../Utils/types";

export type {
  UploadMethodConfig,
  DatasetDependenciesConfig,
  UploadFormConfig,
} from "./form-config";


export type DatasetFormData = Partial<api.DatasetPostRequest>;

// region Dataset Data Upload

export enum DataUploadType {
  SingleFile = "single-file",
  MultiFile = "multi-file",
  URL = "url",
  Result = "result",
}

export type DataUploadKind<T> = T extends BaseDataUpload<infer K> ? K : never;

export type DataUpload =
  | SingleDataFileUpload
  | MultiDataFileUpload
  | UrlUpload
  | ResultUpload;

export interface BaseDataUpload<T extends DataUploadType> {
  readonly kind: T;
}

export interface SingleDataFileUpload extends BaseDataUpload<DataUploadType.SingleFile> {
  readonly file: File,
}

export const newSingleFileUpload = (file: File): SingleDataFileUpload =>
  ({ file, kind: DataUploadType.SingleFile });

export interface MultiDataFileUpload extends BaseDataUpload<DataUploadType.MultiFile> {
  readonly files: File[],
}

export interface UrlUpload extends BaseDataUpload<DataUploadType.URL> {
  readonly url: string;
}

export const newUrlUpload = (url: string): UrlUpload => ({ url, kind: DataUploadType.URL });

export interface ResultUpload extends BaseDataUpload<DataUploadType.Result> {
  readonly stepId: number;
  readonly compatibleRecordTypes: CompatibleRecordTypes;
}

export const newResultUpload = (stepId: number, compatibleRecordTypes: CompatibleRecordTypes): ResultUpload =>
  ({ stepId, compatibleRecordTypes, kind: DataUploadType.Result });

export const dataUploadIsComplete = (value: Partial<DataUpload>): boolean => {
  return (value.kind === DataUploadType.SingleFile && value.file != null)
    || (value.kind === DataUploadType.MultiFile && value.files != null)
    || (value.kind === DataUploadType.URL && value.url != null)
    || (value.kind === DataUploadType.Result && value.stepId != null && value.compatibleRecordTypes != null);
};

// endregion Dataset Data Upload

// region Dataset Meta Files

export interface MetaFileUpload {
  readonly file: File;
}

// endregion Dataset Meta Files
