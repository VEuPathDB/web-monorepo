export interface DatasetUploads {
  readonly url?: string;
  readonly dataFiles?: FileList;
  readonly documentFiles?: FileList;
  readonly dataPropertiesFiles?: FileList;
}

export type DatasetZipType = 'upload' | 'install';

export type RootDatasetFile =
  | 'upload'
  | 'install'
  | 'metadata.json'
  | 'upload-errors.json';

export function hasUploads(obj: DatasetUploads): boolean {
  return (
    (typeof obj.url === 'string' && obj.url.length > 0) ||
    (obj.dataFiles != null && obj.dataFiles.length > 0) ||
    (obj.documentFiles != null && obj.documentFiles.length > 0) ||
    (obj.dataPropertiesFiles != null && obj.dataPropertiesFiles.length > 0)
  );
}
