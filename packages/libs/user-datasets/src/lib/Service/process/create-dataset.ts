import {
  DatasetContact,
  DatasetPostDetails,
  DatasetPostResponseBody,
  DatasetUploads,
  PostCharacteristics,
} from '../Model';
import { DatasetUpload, VdiService } from '../VdiService';
import { BadUpload } from '../../StoreModules';
import { Consumer } from '../../Utils';
import { isEmpty } from 'lodash';
import { ExternalIdentifiers } from '../Model/response-decoders';

export interface NewDatasetSubmission {
  readonly service: VdiService;

  readonly onProgress?: Consumer<number>;
  readonly onSuccess?: Consumer<DatasetPostResponseBody>;
  readonly onError?: Consumer<BadUpload>;

  readonly details: DatasetPostDetails;
  readonly uploads: DatasetUploads;
}

export async function submitNewDataset({
  service,
  details,
  uploads,
  ...req
}: NewDatasetSubmission) {
  const dataFiles = uploads.dataFiles?.map(convertDataFile) ?? [];

  const combinedUploads = uploads.url
    ? [convertUrl(uploads.url), ...dataFiles]
    : dataFiles;

  const scrubbedDetails = scrubDetails(details);

  await service.postDataset(
    scrubbedDetails,
    combinedUploads,
    req.onProgress,
    req.onSuccess,
    req.onError
  );
}

/**
 * Remove empty values that may have been left dangling from the upload form.
 *
 * @param details
 */
function scrubDetails(details: DatasetPostDetails): DatasetPostDetails {
  return {
    ...details,

    installTargets: removeEmpties(details.installTargets),
    contacts: pruneContacts(details.contacts),
    datasetSources: removeEmpties(details.datasetSources),
    dependencies: removeEmpties(details.dependencies),
    funding: removeEmpties(details.funding),
    linkedDatasets: removeEmpties(details.linkedDatasets),
    publications: removeEmpties(details.publications),

    externalIdentifiers: scrubExternalIdentifiers(details.externalIdentifiers),
    datasetCharacteristics: scrubDatasetCharacteristics(
      details.datasetCharacteristics
    ),
  };
}

function pruneContacts(contacts: DatasetContact[] | undefined): DatasetContact[] | undefined  {
  if (!contacts)
    return undefined;

  const out: DatasetContact[] = [];

  for (const contact of contacts) {
    const res = pruneContact(contact);

    if (res)
      out.push(res);
  }

  return out.length > 0
    ? out
    : undefined;
}

function pruneContact(contact: DatasetContact | undefined): DatasetContact | undefined {
  if (!contact)
    return undefined;

  return contact.firstName || contact.middleName || contact.lastName
    || contact.country || contact.affiliation || contact.email
    || contact.isPrimary
    ? contact
    : undefined;
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

function scrubDatasetCharacteristics(
  dChars: PostCharacteristics | undefined
): PostCharacteristics | undefined {
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

function removeEmpties<T>(values: T[] | undefined): T[] | undefined {
  if (isEmpty(values)) return undefined;

  const out = [];

  for (const val of values!) {
    if (!isEmpty(val)) out.push(val);
  }

  return isEmpty(out) ? undefined : out;
}

function convertDataFile(file: File): DatasetUpload {
  return { type: 'dataFile', file };
}

function convertUrl(url: string): DatasetUpload {
  return { type: 'url', url };
}
