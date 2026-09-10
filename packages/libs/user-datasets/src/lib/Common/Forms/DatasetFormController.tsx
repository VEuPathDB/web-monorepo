import React, {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DatasetFormConfig } from '../Configuration';
import {
  DatasetId,
  PartialDatasetDetails,
  useVdiService,
  VdiServiceMetadata,
} from '../../Service';
import { useDispatch, useSelector } from 'react-redux';
import { StateSlice } from '../../StoreModules/types';
import {
  clearBadUpload,
  trackUploadProgress,
  updateFormState,
} from '../../Actions/UserDatasetUploadActions';
import { DatasetFormProps } from './DatasetFormProps';
import { SubmissionModal } from './Components';
import { DatasetMetadata } from '../../Service/Model';
import { DataNoun, Nullable, useSimpleState } from '../../Utils';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { MetadataImportModalController } from './Components/Modals/MetaImportModal';

export interface DatasetFormControllerProps<
  P extends DatasetFormProps = DatasetFormProps
> {
  readonly baseUrl: string;
  readonly form: JSXElementConstructor<P>;
  readonly formConfig: DatasetFormConfig;
  readonly vdiConfig: VdiServiceMetadata;
  readonly propFactory: (baseProps: DatasetFormProps) => P;
  readonly dataNoun: DataNoun;
  readonly enablePublicDatasets: boolean;
}

export function DatasetFormController<
  P extends DatasetFormProps = DatasetFormProps
>(props: DatasetFormControllerProps<P>): ReactElement {
  const { form: Form } = props;

  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  // region Upload State

  const badUploadState = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessages
  );

  const uploadProgress = useSelector(
    (stateSlice: StateSlice) =>
      stateSlice.userDatasetUpload.uploadProgress?.progress
  );

  useEffect(() => {
    if (badUploadState != null) {
      dispatch(trackUploadProgress(null));
      setSubmitting(false);
    }
  }, [badUploadState, dispatch]);

  useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, []);

  // endregion Upload State

  // region Dataset Selection Modal

  const vdi = useVdiService();
  const formState = useDatasetFormState();

  const isDatasetSelectionVisible = useSimpleState(false);

  const fetchDatasetMetadata = useCallback(
    (id: DatasetId) => {
      if (!vdi) {
        return;
      }

      vdi.getRawDatasetMetadata(id, false).then((res) => {
        if ('status' in res) {
          throw new Error(
            `failed to fetch dataset ${id}: ${res.status} ${res.message ?? ''}`
          );
        }

        dispatch(
          updateFormState({
            fileUploads: formState.fileUploads,
            datasetDetails: applyMetadata(formState.datasetDetails, res),
          })
        );
      });
    },
    // the vdi instance itself doesn't matter as long as it exists
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vdi != null, formState]
  );

  // endregion Dataset Selection Modal

  const formProps = props.propFactory({
    baseUrl: props.baseUrl,
    formConfig: props.formConfig,
    vdiConfig: props.vdiConfig,
    isSubmitting: submitting,
    uploadProgress: uploadProgress ?? null,
    badUploadState: badUploadState,
    actions: {
      submit: notImplemented,
      clearUploadError: clearBadUpload,
      setSubmitting,
      openMetaImportModal: () => isDatasetSelectionVisible.set(true),
    },
  });

  return (
    <div className="stack">
      <Form {...formProps} />

      <MetadataImportModalController
        baseUrl={props.baseUrl}
        vdiConfig={props.vdiConfig.configuration}
        dataNoun={props.dataNoun}
        visibleState={isDatasetSelectionVisible}
        onDatasetSelect={fetchDatasetMetadata}
        publicDatasetsEnabled={props.enablePublicDatasets}
      />

      <SubmissionModal
        submitting={submitting}
        uploadProgress={uploadProgress ?? 0.001}
      />
    </div>
  );
}

function notImplemented() {
  throw new Error('form submission not implemented');
}

function setMetadata<K extends keyof PartialDatasetDetails>(
  obj: any,
  key: K,
  value: PartialDatasetDetails[K]
) {
  obj[key] = value;
}

function applyMetadata(
  formMeta: Nullable<PartialDatasetDetails>,
  rawMeta: DatasetMetadata
): PartialDatasetDetails {
  const out: Record<string, any> & {
    set?<K extends keyof PartialDatasetDetails>(
      key: K,
      value: PartialDatasetDetails[K]
    ): void;
  } = { ...(formMeta ?? {}) };

  setMetadata(out, 'description', rawMeta.description);
  setMetadata(out, 'publications', rawMeta.publications);
  setMetadata(out, 'contacts', rawMeta.contacts);
  setMetadata(out, 'shortAttribution', rawMeta.shortAttribution);
  setMetadata(out, 'projectName', rawMeta.projectName);
  setMetadata(out, 'programName', rawMeta.programName);
  setMetadata(out, 'linkedDatasets', rawMeta.linkedDatasets);
  setMetadata(out, 'experimentalOrganism', rawMeta.experimentalOrganism);
  setMetadata(out, 'hostOrganism', rawMeta.hostOrganism);
  setMetadata(out, 'datasetCharacteristics', rawMeta.datasetCharacteristics);
  setMetadata(out, 'externalIdentifiers', rawMeta.externalIdentifiers);
  setMetadata(out, 'funding', rawMeta.funding);
  setMetadata(out, 'dataDisclaimer', rawMeta.dataDisclaimer);
  setMetadata(out, 'datasetSources', rawMeta.datasetSources);

  return out as PartialDatasetDetails;
}
