import { ReactElement, useCallback } from 'react';
import { UploadFormProps } from '../UploadForm';
import { JsonPathBuilder } from '../../../../Utils';
import { CoreDatasetInformation } from './Core';
import { useDispatch } from 'react-redux';
import {
  ClientSideUploadFormState,
  useUploadFormState,
} from '../../../../StoreModules/UserDatasetUploadStoreModule';
import { DatasetPostDetails } from '../../../../Service';
import { updateFormState } from '../../../../Actions/UserDatasetUploadActions';

export interface MetadataSectionProps {
  readonly formProps: UploadFormProps;
  readonly jsonPath: JsonPathBuilder;
}

export function MetadataSection({
  formProps,
  jsonPath,
}: MetadataSectionProps): ReactElement {
  const dispatch = useDispatch();
  const { datasetDetails, fileUploads, formMetaState } = useUploadFormState();

  const setMetadata = useCallback(
    (datasetDetails: DatasetPostDetails) =>
      dispatch(updateFormState({ datasetDetails, fileUploads, formMetaState })),
    [dispatch, fileUploads, formMetaState]
  );

  const setFormState = useCallback(
    (formMetaState: ClientSideUploadFormState) =>
      dispatch(updateFormState({ datasetDetails, fileUploads, formMetaState })),
    [dispatch, datasetDetails, fileUploads]
  );

  return (
    <section className="relative-root">
      <h2>
        {formProps.verbiage.metadataSectionTitle ?? 'Provide Dataset Metadata:'}
      </h2>
      <ImportMetaButton />

      <CoreDatasetInformation
        datasetMeta={datasetDetails}
        setDatasetMeta={setMetadata}
        clientSideState={formMetaState}
        setClientSideState={setFormState}
        jsonPath={jsonPath}
      />
    </section>
  );
}

function ImportMetaButton(): ReactElement {
  return <button>Import from Existing Dataset</button>;
}
