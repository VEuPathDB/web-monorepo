import { DatasetGetResponseBody, PartialDatasetDetails, VdiErrorCode } from '../Model';

/**
 * "Convert" the response object to by pruning out derived fields returned by
 * VDI that are not parts of the dataset's metadata.
 */
export function convertDetailsToMeta(meta: DatasetGetResponseBody): PartialDatasetDetails {
  // deep copy
  return JSON.parse(JSON.stringify({
    name: meta.name,
    summary: meta.summary,
    dependencies: meta.dependencies,
    description: meta.description,
    publications: meta.publications,
    visibility: meta.visibility,
    contacts: meta.contacts,
    projectName: meta.projectName,
    programName: meta.programName,
    linkedDatasets: meta.linkedDatasets,
    experimentalOrganism: meta.experimentalOrganism,
    hostOrganism: meta.hostOrganism,
    datasetCharacteristics: meta.datasetCharacteristics,
    externalIdentifiers: meta.externalIdentifiers,
    funding: meta.funding,
    shortAttribution: meta.shortAttribution,
    daysForApproval: meta.daysForApproval,
    dataDisclaimer: meta.dataDisclaimer,
    datasetSources: meta.datasetSources,
  }));
}

export function statusStringToCode(status: VdiErrorCode): number | null {
  switch (status) {
    case "bad-request":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not-found":
      return 404;
    case "bad-method":
      return 405;
    case "conflict":
      return 409;
    case "gone":
      return 410;
    case "invalid-input":
      return 422;
    case "failed-dependency":
      return 424;
    case "too-early":
      return 425;
    case "server-error":
      return 500;
    default:
      return null;
  }
}