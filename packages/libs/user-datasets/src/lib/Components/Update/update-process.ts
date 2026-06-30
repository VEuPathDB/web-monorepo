import {
  DatasetGetResponseBody,
  DatasetId,
  DatasetUploads,
  PartialDatasetDetails,
  ValidationErrors,
  VdiService
} from '../../Service';
import {
  DatasetCharacteristicsPatch,
  DatasetPatchRequest,
  ExternalIdentifiersPatch,
  OptionalValuePatch,
} from '../../Service/Model';
import { isEmpty, isEqual } from 'lodash';
import { Dispatch } from 'redux';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { receiveBadUpload, trackUploadProgress } from '../../Actions/UserDatasetUploadActions';
import { DatasetPatchResponse } from '../../Service/Model/response-decoders';

export interface UpdateSubmission {
  readonly vdi:       VdiService;
  readonly datasetId: DatasetId;
  readonly original:  PartialDatasetDetails;
  readonly updated:   PartialDatasetDetails;
  readonly files:     DatasetUploads;
  readonly dispatch:  Dispatch<any, EpicDependencies>;
}

export interface UpdateResult {
  readonly patchResult: PatchResult;
  readonly putResult: PutResult;
}

export async function submitUpdate(submission: UpdateSubmission): Promise<UpdateResult> {
  const { vdi, datasetId } = submission;

  const patchBody = convertMetaToPatch(submission.original, submission.updated);

  return {
    patchResult: patchBody == null
      ? { status: 'success' }
      : await submitPatch(vdi, datasetId, patchBody),
    putResult: submission.files.dataPropertiesFiles
      ? await submitPut(submission)
      : { status: 'success' }
  };
}

// region PUT

interface PutError {
  readonly code: number;
  readonly fileName: string;
  readonly message: string;
}

type PutResult =
  | {
    readonly status: 'success';
  }
  | {
    readonly status: 'user-error';
    readonly errors: readonly PutError[];
  }
  | {
    readonly status: 'process-error';
    readonly error: string;
  }

async function submitPut({
  vdi,
  datasetId,
  files,
  dispatch,
}: UpdateSubmission): Promise<PutResult> {
  const promises: Promise<[string, number, string?]>[] = [];

  for (const file of files.dataPropertiesFiles!) {
    promises.push(new Promise<[string, number, string?]>(
      (good, bad) => {
        try {
          vdi.putDatasetVarPropsFile(
            datasetId,
            file,
            (code, msg) => good([ file.name, code, msg ]),
            percent => dispatch(trackUploadProgress(percent)),
            error => dispatch(receiveBadUpload([{
              type: 500,
              message: error.message,
            }])),
          );
        } catch (e) {
          bad(e);
        }
      }
    ));
  }

  let results: [string, number, string?][] | undefined;
  try {
    results = await Promise.all(promises);
  } catch (e) {
    console.log(e);
    return { status: 'process-error', error: String(e) }
  }

  console.log(results);

  const errors = results.filter(([_, code]) => code > 300);

  if (errors.length > 0)
    return {
      status: 'user-error',
      errors: errors.map(([ fileName, code, msg ]) => ({
        code,
        fileName,
        message: msg ?? 'unknown error'
      })),
    };
  else
    return { status: 'success' };
}

// endregion PUT

// region PATCH

export type PatchResult =
  | { readonly status: 'success'; }
  | {
    readonly status: 'error';
    readonly message: string;
  }
  | {
    readonly status: 'invalid';
    readonly errors: ValidationErrors;
  }

async function submitPatch(
  vdi: VdiService,
  datasetId: DatasetId,
  patchBody: DatasetPatchRequest,
): Promise<PatchResult> {
  let response: DatasetPatchResponse;

  try {
    response = await vdi.patchDatasetDetails(
      datasetId,
      patchBody,
    );
  } catch (e) {
    return { status: 'error', message: String(e) };
  }

  if (!response) {
    return { status: 'success' };
  }

  if (response.status === 'invalid-input')
    return {
      status: 'invalid',
      errors: response.errors,
    }

  return { status: 'error', message: response.message ?? 'unknown error' };
}

/**
 * Dataset metadata properties that cannot be modified.  The VDI service will
 * reject requests to patch these properties.
 */
const ImmutableProperties: readonly (keyof PartialDatasetDetails)[] = [
  'installTargets', // would require a data reinstall
  'origin',         // the original source of the dataset doesn't change
  'dependencies',   // would require a data reinstall
];

function convertMetaToPatch(
  original: PartialDatasetDetails,
  updated:  PartialDatasetDetails,
): DatasetPatchRequest | null {
  type PatchValue = OptionalValuePatch<any> | DatasetCharacteristicsPatch | ExternalIdentifiersPatch;

  const patchBody: Record<string, PatchValue> = {};

  for (const key of diffKeys(original, updated)) {
    let patch: PatchValue | null = null;

    // complex types
    // noinspection JSUnreachableSwitchBranches - some branches hidden by io-ts
    switch (key) {
      // simple structs and arrays of simple structs
      case 'contacts':
      case 'datasetSources':
      case 'funding':
      case 'linkedDatasets':
      case 'publications':
      case 'experimentalOrganism':
      case 'hostOrganism':
        patch = isEqual(original[key], updated[key])
          ? null
          : { value: updated[key] ?? null };
        break;

      // complex properties with dedicated subtypes
      case 'externalIdentifiers':
      case 'datasetCharacteristics':
        patch = objectPropertyDiff(original[key], updated[key]);
        break;

      // simple values
      default:
        patch = isEqual(original[key], updated[key])
          ? null
          : { value: updated[key] ?? null };
        break;
    }

    // Don't try and patch immutable properties, in the off chance they make it
    // this far due to copying from api responses.
    if (ImmutableProperties.includes(key))
      continue;

    if (patch != null)
      patchBody[key] = patch;
  }

  return isEmpty(patchBody) ? null : patchBody;
}

function objectPropertyDiff(
  oldVal?: object,
  newVal?: object,
): Record<string, OptionalValuePatch<any>> | null {
  const out: Record<string, OptionalValuePatch<any>> = {};

  for (const key of diffKeys(oldVal ?? {}, newVal ?? {})) {
    if (!isEqual(oldVal?.[key], newVal?.[key]))
      out[key] = { value: newVal?.[key] ?? null };
  }

  return isEmpty(out) ? null : out;
}

function diffKeys<T extends object>(a: T, b: T): Iterable<keyof T> {
  return new Set([ ...typedKeys(a), ...typedKeys(b) ]);
}

function typedKeys<T extends object>(obj: T): readonly (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

// endregion PATCH

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
