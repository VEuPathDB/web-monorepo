export const VDI_MULTIPART_METADATA = 'details';
export const VDI_MULTIPART_DATA_FILE = 'dataFile';
export const VDI_MULTIPART_DOC_FILE = 'docFile';
export const VDI_MULTIPART_DATA_PROP_FILE = 'dataPropertiesFile';
export const VDI_MULTIPART_URL = 'url';

export type GetDatasetsQueryParamEnum = 'install_target' | 'ownership';

export type DatasetUploadFileType =
  | typeof VDI_MULTIPART_DATA_FILE
  | typeof VDI_MULTIPART_DOC_FILE
  | typeof VDI_MULTIPART_DATA_PROP_FILE;

export type DatasetUpload =
  | { type: DatasetUploadFileType; file: File }
  | { type: typeof VDI_MULTIPART_URL; url: string };