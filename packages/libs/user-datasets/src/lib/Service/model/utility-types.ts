export interface DatasetUploads {
  readonly url?: string;
  readonly dataFiles?: File[];
  readonly documentFiles?: File[];
  readonly dataPropertiesFiles?: File[];
}

export type DatasetZipType = 'upload' | 'install';