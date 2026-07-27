import {
  PartialCharacteristics,
  PartialDatasetDetails,
  PartialDatasetPublication as Publication,
} from '../Model';
import { isEmpty } from 'lodash';
import { isNonBlankString } from '../../Utils/value-tests';
import { runIfDefined } from '../../Utils/ergonomics';
import { ExternalIdentifiers } from '../Model/response-decoders';

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

    installTargets: runIfDefined(details.installTargets, removeEmpties),
    contacts: runIfDefined(details.contacts, pruneSimpleRecords),
    datasetSources: runIfDefined(details.datasetSources, pruneSimpleRecords),
    dependencies: runIfDefined(details.dependencies, removeEmpties),
    funding: runIfDefined(details.funding, removeEmpties),
    linkedDatasets: runIfDefined(details.linkedDatasets, removeEmpties),
    publications: runIfDefined(details.publications, prunePublications),
    experimentalOrganism: runIfDefined(
      details.experimentalOrganism,
      cleanSimpleObject
    ),

    externalIdentifiers: runIfDefined(
      details.externalIdentifiers,
      cleanExternalIdentifiers
    ),
    datasetCharacteristics: runIfDefined(
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
  if (isEmpty(dChars)) return undefined;

  return {
    ...dChars,
    associatedFactors: runIfDefined(dChars?.associatedFactors, removeEmpties),
    countries: runIfDefined(dChars?.countries, removeEmpties),
    outcomes: runIfDefined(dChars?.outcomes, removeEmpties),
    sampleTypes: runIfDefined(dChars?.sampleTypes, removeEmpties),
    studySpecies: runIfDefined(dChars?.studySpecies, removeEmpties),
  };
}

// endregion Dataset Characteristics

// region External Identifiers

function cleanExternalIdentifiers(
  ext: ExternalIdentifiers
): ExternalIdentifiers | undefined {
  if (isEmpty(ext)) return undefined;

  return {
    dois: runIfDefined(ext.dois, removeEmpties),
    hyperlinks: runIfDefined(ext.hyperlinks, removeEmpties),
    bioprojectIds: runIfDefined(ext.bioprojectIds, removeEmpties),
  };
}

// endregion External Identifiers

// region Publications

type PubList = readonly Publication[];

function prunePublications(publications: PubList): PubList | undefined {
  if (isEmpty(publications)) {
    return undefined;
  }

  const result: Publication[] = [];

  for (const pub of publications) {
    runIfDefined(cleanPublication(pub), result.push);
  }

  return result.length > 0 ? result : undefined;
}

function cleanPublication(pub: Publication): Publication | undefined {
  return isNonBlankString(pub.identifier) &&
    isNonBlankString(pub.citation) &&
    isNonBlankString(pub.type)
    ? {
        type: pub.type,
        isPrimary: pub.isPrimary,
        identifier: pub.identifier.trim(),
        citation: pub.citation.trim(),
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
  if (isEmpty(values)) return undefined;

  const out = [];

  for (const val of values!) {
    if (!isEmpty(val)) out.push(val);
  }

  return isEmpty(out) ? undefined : out;
}

type SimpleObject = Record<string, string | number | undefined>;
function cleanSimpleObject(obj: SimpleObject): SimpleObject | undefined {
  if (!obj) {
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

  return isEmpty(out) ? undefined : out;
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
