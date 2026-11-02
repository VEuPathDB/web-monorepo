import { TextUploadContent, UploadContent } from './upload-content';
import { DatasetFormState } from '../../StoreModules';
import { ifDefined, Possible } from '../../Utils';
import { ifNotEmpty, takeIf } from '../../Utils/ergonomics';
import { SAMPLE_INFO_FIELD_NAME } from '../utils/rnaseq-rc-data-files';

export interface DatasetUploads {
  readonly url?: string;
  readonly dataFiles?: readonly UploadContent[];
  readonly documentFiles?: readonly UploadContent[];
  readonly dataPropertiesFiles?: readonly UploadContent[];
}

export function newDatasetUploads(state: DatasetFormState): DatasetUploads {
  return {
    url: state.dataFileUrl,
    dataFiles: Object.values(state.dataFileSelections).flat(2),
    documentFiles: Object.values(state.documentFileSelections).flat(2),
    dataPropertiesFiles: Object.values(state.dataPropertiesFileSelections).flat(2),
  };
}

export function hasUploads(obj: DatasetUploads): boolean {
  return (
    (typeof obj.url === 'string' && obj.url.length > 0) ||
    (obj.dataFiles != null && obj.dataFiles.length > 0) ||
    (obj.documentFiles != null && obj.documentFiles.length > 0) ||
    (obj.dataPropertiesFiles != null && obj.dataPropertiesFiles.length > 0)
  );
}

export type DatasetZipType = 'upload' | 'install';

export type RootDatasetFile =
  | 'upload'
  | 'install'
  | 'vdi-meta.json'
  | 'upload-errors.json';

export type UploadContentMap = Readonly<Record<string, ReadonlyArray<UploadContent>>>;

export function getSamplesDescription(dataFiles: UploadContentMap): Possible<TextUploadContent> {
  return takeIf(
    ifDefined(
      dataFiles[SAMPLE_INFO_FIELD_NAME],
      (files) => ifNotEmpty(files, (it) => it[0]),
    ),
    (it) => it?.type === 'text',
  ) as Possible<TextUploadContent>;
}