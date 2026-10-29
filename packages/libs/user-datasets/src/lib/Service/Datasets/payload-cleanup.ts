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
  Possible,
} from '../../Utils';
import { extractPublicationId } from '../Publications';
import { isGenomicsProjectId } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { projectId } from '../../config';
import { Mutable } from '../../Utils/types';

// region Full Submission Payload

export function cleanDatasetDetails(
  details: PartialDatasetDetails
): PartialDatasetDetails {
  const isGenomics = isGenomicsProjectId(projectId);

  const mutableDetails: Mutable<PartialDatasetDetails> = {
    ...details,

    installTargets: ifDefined(details.installTargets, removeEmpties),
    contacts: ifDefined(details.contacts, pruneSimpleRecords),
    datasetSources: ifDefined(details.datasetSources, pruneSimpleRecords),
    dependencies: ifDefined(details.dependencies, removeEmpties),
    funding: ifDefined(details.funding, removeEmpties),
    linkedDatasets: ifDefined(details.linkedDatasets, removeEmpties),
    publications: ifDefined(details.publications, prunePublications),

    experimentalOrganisms: ifDefined(
      details.experimentalOrganisms,
      pruneSimpleRecords,
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

  if (!details.metadataContentFlags?.hasDataDisclaimer)
    delete mutableDetails.dataDisclaimer

  if (!details.metadataContentFlags?.hasDatasetCharacteristics)
    delete mutableDetails.datasetCharacteristics;

  if (!details.metadataContentFlags?.hasDatasetSources)
    delete mutableDetails.datasetSources;

  if (!details.metadataContentFlags?.hasOrganismData) {
    // On genomics sites, this section is always enabled, but the radio option
    // for the section is not explicitly set to "Yes".  Fill in the option for
    // the user if they provided a value.
    if (isGenomics && mutableDetails.experimentalOrganisms != null) {
      mutableDetails.metadataContentFlags = {
        ...(mutableDetails.metadataContentFlags ?? {}),
        hasOrganismData: true,
      };
    } else {
      delete mutableDetails.experimentalOrganisms;
    }
  }

  if (!details.metadataContentFlags?.hasPublications) {
    // On genomics sites, this section is always enabled, but the radio option
    // for the section is not explicitly set to "Yes".  Fill in the option for
    // the user if they provided a value.
    if (isGenomics && mutableDetails.publications != null) {
      mutableDetails.metadataContentFlags = {
        ...(mutableDetails.metadataContentFlags ?? {}),
        hasPublications: true,
      };
    } else {
      delete mutableDetails.publications;
    }
  }

  return mutableDetails;
}

// endregion Full Submission Payload

// region Dataset Characteristics

function cleanDatasetCharacteristics(
  dChars: PartialCharacteristics
): Possible<PartialCharacteristics> {
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
): Possible<ExternalIdentifiers> {
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

function prunePublications(publications: PubList): Possible<PubList> {
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
}: Publication): Possible<Publication> {
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
export function pruneSimpleRecords<T extends object>(
  records: readonly T[]
): Possible<T[]> {
  if (!records) return undefined;

  const out: T[] = [];

  for (const record of records) {
    if (record && !isEmptyObject(record)) out.push(record);
  }

  return out.length > 0 ? out : undefined;
}

function removeEmpties<T>(values: readonly T[]): Possible<T[]> {
  if (!isNonEmpty(values)) {
    return undefined;
  }

  const out = [];

  for (const val of values!) {
    if (isNonEmpty(val)) out.push(val);
  }

  return out.length > 0 ? out : undefined;
}

type SimpleObject = Record<string, Possible<string | number>>;
function cleanSimpleObject(obj: SimpleObject): Possible<SimpleObject> {
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
