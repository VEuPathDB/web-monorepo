import React, { ReactElement, useCallback } from 'react';
import { JsonPathBuilder, Runnable } from '../../../../Utils';
import { CoreDatasetInformation } from './Core';
import { useDispatch } from 'react-redux';
import {
  useDatasetFormState,
} from '../../../../StoreModules/UserDatasetUploadStoreModule';
import { PartialDatasetDetails } from '../../../../Service';
import { updateFormState } from '../../../../Actions/UserDatasetUploadActions';
import { RecommendedInformation } from './Recommended';
import { DatasetFormProps } from '../../DatasetFormProps';
import { SecondaryButton } from '../SecondaryButton';

export interface MetadataSectionProps {
  readonly formProps: DatasetFormProps;
  readonly jsonPath: JsonPathBuilder;
  readonly openMetaImport: Runnable;
}

export function MetadataSection({
  formProps,
  jsonPath,
  openMetaImport,
}: MetadataSectionProps): ReactElement {
  const dispatch = useDispatch();
  const { datasetDetails, fileUploads } = useDatasetFormState();

  const setMetadata = useCallback(
    (datasetDetails: PartialDatasetDetails) =>
      dispatch(updateFormState({ datasetDetails, fileUploads })),
    [dispatch, fileUploads]
  );

  return (
    <section className="relative-root">
      <div className="header-line">
        <h2>Provide Dataset Metadata:</h2>
        <SecondaryButton disabled={false} onClick={openMetaImport}>
          Copy from existing dataset
        </SecondaryButton>
      </div>

      <CoreDatasetInformation
        formProps={formProps}
        datasetMeta={datasetDetails}
        setDatasetMeta={setMetadata}
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
