import {
  DatasetFileDetails,
  DatasetId,
  DatasetUploads,
  PartialDatasetDetails,
  ValidationErrors,
  VdiService
} from '../index';
import {
  DatasetCharacteristicsPatch,
  DatasetPatchRequest,
  DatasetPatchResponse,
  ExternalIdentifiersPatch,
  OptionalValuePatch,
} from '../Model';
import { isEmpty, isEqual } from 'lodash';
import { Dispatch } from 'redux';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { receiveBadUpload, trackUploadProgress } from '../../Actions/UserDatasetUploadActions';
import { statusStringToCode } from '../utils/conversions';
import { scrubDetails } from './create-dataset';
import { ClientSideUploadFormState } from '../../StoreModules';
import { Mutable } from '../../Utils/types';
import { isGenomicsProjectId } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { projectId } from '../../config';

export interface UpdateSubmission {
  readonly vdi:       VdiService;
  readonly datasetId: DatasetId;
  readonly original:  PartialDatasetDetails;
  readonly updated:   PartialDatasetDetails;
  readonly newFiles:  DatasetUploads;
  readonly oldFiles:  DatasetFileDetails[] | undefined;
  readonly dispatch:  Dispatch<any, EpicDependencies>;
  readonly formState: ClientSideUploadFormState;
}

export interface UpdateResult {
  readonly patchResult: PatchResult;
  readonly deleteResult: DeleteResult;
  readonly putResult: PutResult;
}

export async function submitUpdate(submission: UpdateSubmission): Promise<UpdateResult> {
  const { vdi, datasetId } = submission;

  const mutableSubmission: Mutable<PartialDatasetDetails> = { ...submission.updated };

  if (!submission.formState.hasExternalSources) {
    mutableSubmission.datasetSources = undefined;
  }

  if (!submission.formState.hasDisclaimer) {
    mutableSubmission.dataDisclaimer = undefined;
  }

  if (!submission.formState.hasExperimentalOrganism && !isGenomicsProjectId(projectId)) {
    mutableSubmission.experimentalOrganism = undefined;
  }

  if (!submission.formState.isStudy) {
    mutableSubmission.datasetCharacteristics = undefined;
  }

  const patchResult: PatchResult = await (async () => {
    const patchBody = convertMetaToPatch(
      scrubDetails(submission.original),
      scrubDetails(mutableSubmission),
    );

    return patchBody == null
      ? { status: 'success' }
      : await submitPatch(vdi, datasetId, patchBody);
  })();

  const deleteResult: DeleteResult = submission.newFiles.dataPropertiesFiles
    ? await deleteDatasetPropertiesFiles(submission)
    : { status: 'success' };

  const putResult: PutResult = submission.newFiles.dataPropertiesFiles
    ? await submitPut(submission)
    : { status: 'success' }

  return {
    patchResult,
    deleteResult,
    putResult,
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
  newFiles,
  dispatch,
}: UpdateSubmission):Promise<PutResult> {
  const promises: Promise<[string, number, string?]>[] = [];

  for (const file of newFiles.dataPropertiesFiles!) {
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
    console.error(e);
    return { status: 'process-error', error: String(e) }
  }

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

// region DELETE

export type DeleteResult =
  | {
    readonly status: 'success';
  }
  | {
    readonly status: 'error';
    readonly errors: readonly [string, string][];
  };

async function deleteDatasetPropertiesFiles({
  vdi,
  datasetId,
  oldFiles,
  newFiles: { dataPropertiesFiles: newFiles },
}: UpdateSubmission): Promise<DeleteResult> {
  const errors: [string, string][] = [];

  if (!oldFiles)
    return { status: 'success' };

  for (const { fileName } of oldFiles) {
    if (fileListContains(newFiles!, fileName)) {
      continue;
    }

    try {
      const [ code, message ] = await deleteDatasetPropertiesFile(
        vdi,
        datasetId,
        fileName,
      );

      if (code !== 204) {
        errors.push([ fileName, message ?? 'unknown error' ]);
      }
    } catch (e: any) {
      console.error(`error thrown while deleting dataset properties file ${fileName}`, e);
      errors.push([ fileName, 'unknown error' ])
    }
  }

  return errors.length === 0
    ? { status: 'success' }
    : { status: 'error', errors };
}

async function deleteDatasetPropertiesFile(
  vdi: VdiService,
  datasetId: DatasetId,
  fileName: string,
): Promise<readonly [number, string?]> {
  return vdi.deleteDatasetVarPropsFile(datasetId, fileName)
    .then(it => it == null
      ? [204, undefined]
      : [statusStringToCode(it.status) ?? 500, it.message]
    );
}

function fileListContains(list: FileList, fileName: string): boolean {
  for (const { name } of list) {
    if (name === fileName) {
      return true;
    }
  }

  return false;
}

// endregion DELETE