import React, {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DataNoun, DatasetFormConfig } from '../Configuration';
import { useVdiService } from '../../Service';
import { useDispatch } from 'react-redux';
import {
  clearBadUpload,
  trackUploadProgress,
  updateFormMetadata,
} from '../../Actions/UserDatasetUploadActions';
import { DatasetFormProps } from './DatasetFormProps';
import { SubmissionModal } from './Components';
import { ifDefined, Nullable } from '../../Utils';
import { MetadataImportModalController } from './Components/Modals/MetaImportModal';
import { useDatasetMetadata } from './Hooks/dataset-metadata-hooks';
import { useBadUploadMessages, useUploadProgress } from './Hooks/async-action-hooks';
import { DatasetId, DatasetMetadata, PartialDatasetDetails, VdiServiceMetadata } from '../../Service/Model';

export interface DatasetFormControllerProps<
  P extends DatasetFormProps = DatasetFormProps
> {
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

  const badUploadState = useBadUploadMessages();
  const uploadProgress = useUploadProgress();

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

  const service = useVdiService();

  const metadata = useDatasetMetadata();

  const [
    isDatasetSelectionVisible,
    setDatasetSelectionVisible,
  ] = useState<boolean>(false);

  const fetchDatasetMetadata = useCallback(
    async (id: DatasetId) => ifDefined(service, async (vdi) => {
      const res = await vdi.getRawDatasetMetadata(id, false);

      if ('status' in res) {
        throw new Error(
          `failed to fetch dataset ${id}: ${res.status} ${res.message ?? ''}`
        );
      }

      dispatch(updateFormMetadata(applyMetadata(metadata ?? {}, res)));
    }),
    // the vdi instance itself doesn't matter as long as it exists
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [service != null, metadata]
  );

  // endregion Dataset Selection Modal

  const formProps = props.propFactory({
    formConfig: props.formConfig,
    vdiConfig: props.vdiConfig,
    isSubmitting: submitting,
    uploadProgress: uploadProgress ?? null,
    badUploadState: badUploadState,
    actions: {
      submit: notImplemented,
      clearUploadError: clearBadUpload,
      setSubmitting,
      openMetaImportModal: () => setDatasetSelectionVisible(true),
    },
  });

  return (
    <div className="stack">
      <Form {...formProps} />

      <MetadataImportModalController
        vdiConfig={props.vdiConfig.configuration}
        dataNoun={props.dataNoun}
        isVisible={isDatasetSelectionVisible}
        hideModal={() => setDatasetSelectionVisible(false)}
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
  setMetadata(out, 'experimentalOrganisms', rawMeta.experimentalOrganisms);
  setMetadata(out, 'hostOrganism', rawMeta.hostOrganism);
  setMetadata(out, 'datasetCharacteristics', rawMeta.datasetCharacteristics);
  setMetadata(out, 'externalIdentifiers', rawMeta.externalIdentifiers);
  setMetadata(out, 'funding', rawMeta.funding);
  setMetadata(out, 'dataDisclaimer', rawMeta.dataDisclaimer);
  setMetadata(out, 'datasetSources', rawMeta.datasetSources);
  setMetadata(out, 'metadataContentFlags', ifDefined(
    rawMeta.metadataContentFlags,
    it => ({
      hasDatasetCharacteristics: it.hasDatasetCharacteristics ?? undefined,
      hasDatasetSources: it.hasDatasetSources ?? undefined,
      hasDataDisclaimer: it.hasDataDisclaimer ?? undefined,
      hasOrganismData: it.hasOrganismData ?? undefined,
      hasPublications: it.hasPublications ?? undefined,
    }),
  ));

  return out as PartialDatasetDetails;
}
