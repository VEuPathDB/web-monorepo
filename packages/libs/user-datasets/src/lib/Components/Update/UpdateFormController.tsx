import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  DatasetGetResponseBody, DatasetId, DatasetUploads,
  PartialDatasetDetails,
  useVdiService,
  VdiService,
  VdiServiceMetadata
} from '../../Service';
import { DatasetFormController } from '../../Common/Forms/DatasetFormController';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { identity, isEmpty, isEqual } from 'lodash';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { useDispatch } from 'react-redux';
import { updateFormState } from '../../Actions/UserDatasetUploadActions';
import { UpdateForm } from './UpdateForm';
import { configureFormProps, findDatasetTypeConfig } from '../../Common/Configuration';
import { DatasetFormControllerConfig } from '../../Common/Forms/DatasetFormControllerConfig';
import { Modal } from '@veupathdb/coreui';
import { Consumer, Runnable } from '../../Utils';
import { DatasetPatchRequest } from '../../Service/Model';
import {
  DatasetCharacteristicsPatch,
  ExternalIdentifiersPatch,
  OptionalValuePatch
} from '../../Service/Model/request-types';
import { ServerErrorBody, SimpleServiceErrorBody, ValidationErrorBody } from '../../Service/Model/response-decoders';

export interface UpdateFormControllerProps extends DatasetFormControllerConfig {
  readonly datasetId: string;
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceMetadata;
  readonly isPromotingToPublic: boolean;
  readonly closeModal: Runnable;
}

export function UpdateFormController(props: UpdateFormControllerProps): ReactElement {
  const vdi = useVdiService<VdiService>(identity);
  const [ dataset, setDataset ] = useState<DatasetGetResponseBody>();

  const dispatch = useDispatch();
  const formState = useDatasetFormState();

  useEffect(() => {
    if (vdi && props.datasetId)
      (async () => setDataset(await vdi.getDatasetDetails(props.datasetId)))();
  }, [ vdi, props.datasetId ]);

  useEffect(
    () => {
      let title = '';

      if (!title) {
        title = document.title;
      }

      if (dataset) {
        document.title = `Edit My Dataset: ${dataset?.name}`;
        dispatch(updateFormState({ ...formState, datasetDetails: convertDetailsToMeta(dataset) }))
      }

      return () => { document.title = title; }
    },

    // This should only be triggered when the vdi dataset result changes.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ dataset ]
  );

  const formConfig = useMemo(
    () => {
      if (!dataset?.type || !vdi)
        return null;

      const type = findDatasetTypeConfig(dataset.type, props.datasetTypes);

      if (!type)
        return null;

      return {
        ...configureFormProps(type, props.formConfigs, vdi),
        // Disable reference genome input for update form
        dependencies: undefined,
      };
    },

    // Excluded values are constant deep trees.  Re-examining them is needless
    // at best, and expensive at worst.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ dataset, vdi ]
  );

  const submitForm = useCallback(() => {
    // noinspection JSIgnoredPromiseFromCall
    submitUpdate({
      vdi:       vdi!,
      datasetId: props.datasetId,
      original:  convertDetailsToMeta(dataset!),
      updated:   formState.datasetDetails,
      files:     formState.fileUploads,
    });
  }, [dataset, vdi, formState, props.datasetId]);

  if (!dataset || !formConfig)
    return <Loading />;

  return<>
    <Modal
      visible={true}
      toggleVisible={props.closeModal}
      includeCloseButton={true}
      title={document.title}
      titleSize="medium"
    >
      <DatasetFormController
        {...props}
        propFactory={p => ({ ...p, actions: {
          ...p.actions,
          submit: submitForm,
        }})}
        form={UpdateForm}
        formConfig={formConfig}
      />
    </Modal>
  </>;
}

interface UpdateSubmission {
  readonly vdi:       VdiService;
  readonly datasetId: DatasetId;
  readonly original:  PartialDatasetDetails;
  readonly updated:   PartialDatasetDetails;
  readonly files:     DatasetUploads;

  // callbacks
  readonly onPatchSuccess?: Runnable;
  readonly onBadRequest?:   Consumer<ValidationErrorBody>;
  readonly onPatchError?:   Consumer<SimpleServiceErrorBody | ServerErrorBody>;

  readonly onPutSuccess?: Runnable;
  readonly onPutError?:   Consumer<Array<[string, string]>>;
}

async function submitUpdate(submission: UpdateSubmission) {
  const patchBody = convertMetaToPatch(submission.original, submission.updated);

  if (patchBody != null)
    await submitPatch(submission, patchBody);

  if (submission.files.dataPropertiesFiles)
    await submitPut(submission)
}

async function submitPut({
  vdi,
  datasetId,
  files,
  onPutSuccess,
  onPutError,
}: UpdateSubmission) {
  const promises: Promise<[string, number, string?]>[] = [];

  for (const file of files.dataPropertiesFiles!) {
    promises.push(new Promise<[string, number, string?]>(
      (good, _) => vdi.putDatasetVarPropsFile(
        datasetId,
        file,
        (c, m) => good([file.name, c, m]),
      ),
    ));
  }

  const results = await Promise.all(promises);

  const errors = results.filter(([_, code]) => code > 300);

  if (errors.length > 0)
    onPutError?.(errors.map(a => [a[0], a[2] ?? 'unknown error']))
  else
    onPutSuccess?.();
}

async function submitPatch(
  {
    vdi,
    datasetId,
    onPatchSuccess,
    onBadRequest,
    onPatchError,
  }: UpdateSubmission,
  patchBody: DatasetPatchRequest,
){
  await vdi.patchDatasetDetails(
    datasetId,
    patchBody,
    onPatchSuccess,
    onBadRequest,
    onPatchError
  );
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

/**
 * "Convert" the response object to by pruning out derived fields returned by
 * VDI that are not parts of the dataset's metadata.
 */
function convertDetailsToMeta(meta: DatasetGetResponseBody): PartialDatasetDetails {
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
