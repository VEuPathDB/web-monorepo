import React from 'react';
import * as vdi from '../../Service';
import * as util from '../../Utils';

import { DatasetFormConfig } from '../Configuration';

import { useDispatch } from 'react-redux';
import {
  clearBadUpload,
  trackUploadProgress,
  updateFormMetadata,
} from '../../Actions/UserDatasetUploadActions';
import { DatasetFormProps } from './DatasetFormProps';
import { SubmissionModal } from './Components';
import { DataNoun } from '../../Utils';
import { MetadataImportModalController } from './Components/Modals/MetaImportModal';

import { useDatasetMetadata } from './Hooks/dataset-metadata-hooks';
import { useBadUploadMessages, useUploadProgress } from './Hooks/async-action-hooks';

export interface DatasetFormControllerProps<P extends DatasetFormProps = DatasetFormProps> {
  readonly baseUrl: string;
  readonly form: React.JSXElementConstructor<P>;
  readonly formConfig: DatasetFormConfig;
  readonly vdiConfig: vdi.VdiServiceMetadata;
  readonly propFactory: util.Function<DatasetFormProps, P>;
  readonly dataNoun: DataNoun;
  readonly enablePublicDatasets: boolean;
}

export function DatasetFormController<
  P extends DatasetFormProps = DatasetFormProps
>(props: DatasetFormControllerProps<P>): React.ReactElement {
  const { form: Form } = props;

  const [submitting, setSubmitting] = React.useState(false);

  const dispatch = useDispatch();

  // region Upload State

  const badUploadState = useBadUploadMessages();
  const uploadProgress = useUploadProgress();

  React.useEffect(() => {
    if (badUploadState != null) {
      dispatch(trackUploadProgress(null));
      setSubmitting(false);
    }
  }, [badUploadState, dispatch]);

  React.useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, []);

  // endregion Upload State

  // region Dataset Selection Modal

  const service = vdi.useVdiService();

  const metadata = useDatasetMetadata();

  const isDatasetSelectionVisible = util.useSimpleState(false);

  const fetchDatasetMetadata = React.useCallback(
    async (id: vdi.DatasetId) => util.ifDefined(service, async (vdi) => {
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

function setMetadata<K extends keyof vdi.PartialDatasetDetails>(
  obj: any,
  key: K,
  value: vdi.PartialDatasetDetails[K]
) {
  obj[key] = value;
}

function applyMetadata(
  formMeta: util.Nullable<vdi.PartialDatasetDetails>,
  rawMeta: vdi.DatasetMetadata
): vdi.PartialDatasetDetails {
  const out: Record<string, any> & {
    set?<K extends keyof vdi.PartialDatasetDetails>(
      key: K,
      value: vdi.PartialDatasetDetails[K]
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
  setMetadata(out, 'metadataContentFlags', util.ifDefined(
    rawMeta.metadataContentFlags,
    it => ({
      hasDatasetCharacteristics: it.hasDatasetCharacteristics ?? undefined,
      hasDatasetSources: it.hasDatasetSources ?? undefined,
      hasDataDisclaimer: it.hasDataDisclaimer ?? undefined,
      hasOrganismData: it.hasOrganismData ?? undefined,
      hasPublications: it.hasPublications ?? undefined,
    }),
  ));

  return out as vdi.PartialDatasetDetails;
}
