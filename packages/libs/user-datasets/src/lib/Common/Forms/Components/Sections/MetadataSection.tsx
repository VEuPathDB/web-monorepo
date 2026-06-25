import React, { ReactElement, useCallback } from 'react';
import { JsonPathBuilder } from '../../../../Utils';
import { CoreDatasetInformation } from './Core';
import { useDispatch } from 'react-redux';
import {
  ClientSideUploadFormState,
  useDatasetFormState,
} from '../../../../StoreModules/UserDatasetUploadStoreModule';
import { PartialDatasetDetails } from '../../../../Service';
import { updateFormState } from '../../../../Actions/UserDatasetUploadActions';
import { RecommendedInformation } from './Recommended';
import { DatasetFormProps } from '../../DatasetFormProps';

export interface MetadataSectionProps {
  readonly formProps: DatasetFormProps;
  readonly jsonPath: JsonPathBuilder;
}

export function MetadataSection({
  formProps,
  jsonPath,
}: MetadataSectionProps): ReactElement {
  const dispatch = useDispatch();
  const { datasetDetails, fileUploads, formMetaState } = useDatasetFormState();

  const setMetadata = useCallback(
    (datasetDetails: PartialDatasetDetails) =>
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
      <h2>Provide Dataset Metadata</h2>

      <CoreDatasetInformation
        formProps={formProps}
        datasetMeta={datasetDetails}
        setDatasetMeta={setMetadata}
        clientSideState={formMetaState}
        setClientSideState={setFormState}
        jsonPath={jsonPath}
      />

      <RecommendedInformation
        datasetMeta={datasetDetails}
        setDatasetMeta={setMetadata}
        jsonPath={jsonPath}
      />
    </section>
  );
}
