import {
  PartialDatasetDetails,
  DatasetPostResponseBody,
  DatasetUploads,
  PartialCharacteristics,
} from '../Model';
import { DatasetUpload, VdiService } from '../VdiService';
import { BadUpload } from '../../StoreModules';
import { Consumer, Function } from '../../Utils';
import { isEmpty } from 'lodash';
import { ExternalIdentifiers } from '../Model/response-decoders';
import { sanitizeFileName } from '../utils/sanitization';
import { isNonBlankString } from '../../Utils/value-tests';

export interface NewDatasetSubmission {
  readonly service: VdiService;

  readonly onProgress?: Consumer<number>;
  readonly onSuccess?: Consumer<DatasetPostResponseBody>;
  readonly onError?: Consumer<BadUpload>;

  readonly details: PartialDatasetDetails;
  readonly uploads: DatasetUploads;
}

export async function submitNewDataset({
  service,
  details,
  uploads,
  ...req
}: NewDatasetSubmission) {
  const combinedUploads: DatasetUpload[] = [];

  if (isNonBlankString(uploads.url)) {
    combinedUploads.push(convertUrl(uploads.url));
  } else {
    appendFiles(uploads.dataFiles, convertDataFile, combinedUploads);
  }

  appendFiles(uploads.documentFiles, convertDocumentFile, combinedUploads);
  appendFiles(
    uploads.dataPropertiesFiles,
    convertPropertiesFile,
    combinedUploads
  );

  const scrubbedDetails = scrubDetails(details);

  await service.postDataset(
    scrubbedDetails,
    combinedUploads,
    req.onProgress,
    req.onSuccess,
    req.onError
  );
}

function appendFiles(
  fileList: FileList | undefined,
  converter: Function<File, DatasetUpload>,
  combinedUploads: DatasetUpload[]
) {
  if (fileList == null) {
    return;
  }

  for (const file of fileList) {
    combinedUploads.push(converter(sanitizeFileName(file)));
  }
}

/**
 * Remove empty values that may have been left dangling from the upload form.
 *
 * @param details
 */
export function scrubDetails(
  details: PartialDatasetDetails
): PartialDatasetDetails {
  return {
    ...details,

    installTargets: removeEmpties(details.installTargets),
    contacts: pruneSimpleRecords(details.contacts),
    datasetSources: pruneSimpleRecords(details.datasetSources),
    dependencies: removeEmpties(details.dependencies),
    funding: removeEmpties(details.funding),
    linkedDatasets: removeEmpties(details.linkedDatasets),
    publications: removeEmpties(details.publications),
    experimentalOrganism: scrubSimpleObject(details.experimentalOrganism),

    externalIdentifiers: scrubExternalIdentifiers(details.externalIdentifiers),
    datasetCharacteristics: scrubDatasetCharacteristics(
      details.datasetCharacteristics
    ),
  };
}

/**
 * Prunes arrays of simple key/value objects by removing objects that contain no
 * truthy property values.
 *
 * If the resulting array is empty, the array itself is to be 'pruned', and
 * undefined will be returned.
 */
function pruneSimpleRecords<T extends object>(
  records: readonly T[] | undefined
): T[] | undefined {
  if (!records) return undefined;

  const out: T[] = [];

  for (const record of records) {
    if (record && !isEmptyObject(record)) out.push(record);
  }

  return out.length > 0 ? out : undefined;
}

function scrubExternalIdentifiers(
  ext: ExternalIdentifiers | undefined
): ExternalIdentifiers | undefined {
  if (isEmpty(ext)) return undefined;

  return {
    dois: removeEmpties(ext.dois),
    hyperlinks: removeEmpties(ext.hyperlinks),
    bioprojectIds: removeEmpties(ext.bioprojectIds),
  };
}

type SimpleObject = Record<string, string | number | undefined>;
function scrubSimpleObject(
  obj: SimpleObject | undefined
): SimpleObject | undefined {
  if (!obj) return undefined;

  const out: SimpleObject = {};

  for (const [key, value] of Object.entries(obj)) {
    switch (typeof value) {
      case 'string':
        if (value.length > 0) out[key] = value;
        break;

      case 'number':
        out[key] = value;
        break;
    }
  }

  return isEmpty(out) ? undefined : out;
}

function scrubDatasetCharacteristics(
  dChars: PartialCharacteristics | undefined
): PartialCharacteristics | undefined {
  if (isEmpty(dChars)) return undefined;

  return {
    ...dChars,
    associatedFactors: removeEmpties(dChars?.associatedFactors),
    countries: removeEmpties(dChars?.countries),
    outcomes: removeEmpties(dChars?.outcomes),
    sampleTypes: removeEmpties(dChars?.sampleTypes),
    studySpecies: removeEmpties(dChars?.studySpecies),
  };
}

/**
 * Tests if a given object contains truthy values.
 */
function isEmptyObject(obj: Record<string, any>): boolean {
  for (const key of Object.keys(obj)) if (obj[key]) return false;

  return true;
}

function removeEmpties<T>(values: readonly T[] | undefined): T[] | undefined {
  if (isEmpty(values)) return undefined;

  const out = [];

  for (const val of values!) {
    if (!isEmpty(val)) out.push(val);
  }

  return isEmpty(out) ? undefined : out;
}

function convertDocumentFile(file: File): DatasetUpload {
  return { type: 'docFile', file };
}

function convertPropertiesFile(file: File): DatasetUpload {
  return { type: 'dataPropertiesFile', file };
}

function convertDataFile(file: File): DatasetUpload {
  return { type: 'dataFile', file };
}

function convertUrl(url: string): DatasetUpload {
  return { type: 'url', url };
}
