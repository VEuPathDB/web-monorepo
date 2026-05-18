export interface DatasetUploads {
  readonly url?: string;
  readonly dataFiles?: File[];
  readonly documentFiles?: File[];
  readonly dataPropertiesFiles?: FileList;
}

export type DatasetZipType = 'upload' | 'install';

export type RootDatasetFile =
  | 'upload'
  | 'install'
  | 'metadata.json'
  | 'upload-errors.json';
