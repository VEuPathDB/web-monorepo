import {
  ExternalIdentifiers,
  PartialCharacteristics,
  PartialDatasetDetails,
  PartialDatasetPublication as Publication,
} from '../Model';
import {
  isNonBlankString,
  isNonEmpty,
  ifDefined,
  requireValue,
} from '../../Utils';
import { extractPublicationId } from '../Publications';

// region Full Submission Payload

/**
 * Remove empty values that may have been left dangling from the upload form.
 *
 * @param details
 */
export function cleanDatasetDetails(
  details: PartialDatasetDetails
): PartialDatasetDetails {
  return {
    ...details,

    installTargets: ifDefined(details.installTargets, removeEmpties),
    contacts: ifDefined(details.contacts, pruneSimpleRecords),
    datasetSources: ifDefined(details.datasetSources, pruneSimpleRecords),
    dependencies: ifDefined(details.dependencies, removeEmpties),
    funding: ifDefined(details.funding, removeEmpties),
    linkedDatasets: ifDefined(details.linkedDatasets, removeEmpties),
    publications: ifDefined(details.publications, prunePublications),
    experimentalOrganism: ifDefined(
      details.experimentalOrganism,
      cleanSimpleObject
    ),

    externalIdentifiers: ifDefined(
      details.externalIdentifiers,
      cleanExternalIdentifiers
    ),
    datasetCharacteristics: ifDefined(
      details.datasetCharacteristics,
      cleanDatasetCharacteristics
    ),
  };
}

// endregion Full Submission Payload

// region Dataset Characteristics

function cleanDatasetCharacteristics(
  dChars: PartialCharacteristics
): PartialCharacteristics | undefined {
  return isNonEmpty<PartialCharacteristics>(dChars)
    ? {
        ...dChars,
        associatedFactors: ifDefined(dChars?.associatedFactors, removeEmpties),
        countries: ifDefined(dChars?.countries, removeEmpties),
        outcomes: ifDefined(dChars?.outcomes, removeEmpties),
        sampleTypes: ifDefined(dChars?.sampleTypes, removeEmpties),
        studySpecies: ifDefined(dChars?.studySpecies, removeEmpties),
      }
    : undefined;
}

// endregion Dataset Characteristics

// region External Identifiers

function cleanExternalIdentifiers(
  ext: ExternalIdentifiers
): ExternalIdentifiers | undefined {
  return isNonEmpty(ext)
    ? {
        dois: ifDefined(ext.dois, removeEmpties),
        hyperlinks: ifDefined(ext.hyperlinks, removeEmpties),
        bioprojectIds: ifDefined(ext.bioprojectIds, removeEmpties),
      }
    : undefined;
}

// endregion External Identifiers

// region Publications

type PubList = readonly Publication[];

function prunePublications(publications: PubList): PubList | undefined {
  if (!isNonEmpty(publications)) {
    return undefined;
  }

  const result: Publication[] = [];

  for (const pub of publications) {
    ifDefined(ifDefined(pub, cleanPublication), (it) => result.push(it));
  }

  return result.length > 0 ? result : undefined;
}

function cleanPublication({
  identifier,
  type,
  isPrimary,
  citation,
}: Publication): Publication | undefined {
  return isNonBlankString(identifier) &&
    isNonBlankString(citation) &&
    isNonBlankString(type)
    ? {
        type,
        isPrimary,
        identifier: requireValue(extractPublicationId(identifier, type)),
        citation: citation.trim(),
      }
    : undefined;
}

// endregion Publications

// region Common Functionality

/**
 * Prunes arrays of simple key/value objects by removing objects that contain no
 * truthy property values.
 *
 * If the resulting array is empty, the array itself is to be 'pruned', and
 * undefined will be returned.
 */
function pruneSimpleRecords<T extends object>(
  records: readonly T[]
): T[] | undefined {
  if (!records) return undefined;

  const out: T[] = [];

  for (const record of records) {
    if (record && !isEmptyObject(record)) out.push(record);
  }

  return out.length > 0 ? out : undefined;
}

function removeEmpties<T>(values: readonly T[]): T[] | undefined {
  if (!isNonEmpty(values)) {
    return undefined;
  }

  const out = [];

  for (const val of values!) {
    if (isNonEmpty(val)) out.push(val);
  }

  return out.length > 0 ? out : undefined;
}

type SimpleObject = Record<string, string | number | undefined>;
function cleanSimpleObject(obj: SimpleObject): SimpleObject | undefined {
  if (!isNonEmpty(obj)) {
    return undefined;
  }

  const out: SimpleObject = {};

  for (const [key, value] of Object.entries(obj)) {
    switch (typeof value) {
      case 'string':
        if (value.length > 0) {
          out[key] = value;
        }
        break;

      case 'number':
        out[key] = value;
        break;
    }
  }

  return isNonEmpty(out) ? out : undefined;
}

/**
 * Tests if a given object contains truthy values.
 */
function isEmptyObject(obj: Record<string, any>): boolean {
  for (const key of Object.keys(obj)) {
    if (obj[key]) {
      return false;
    }
  }

  return true;
}

// endregion Common Functionality
