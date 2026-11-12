import React from 'react';
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
import { ActionKind, DatasetFormButton } from '../DatasetFormButton';

export interface MetadataSectionProps {
  readonly formProps: DatasetFormProps;
  readonly jsonPath: JsonPathBuilder;
  readonly openMetaImport: Runnable;
}

export function MetadataSection({
  formProps,
  jsonPath,
  openMetaImport,
}: MetadataSectionProps): React.ReactElement {
  const dispatch = useDispatch();
  const { datasetDetails, ...fileUploads } = useDatasetFormState();

  const setMetadata = React.useCallback(
    (datasetDetails: PartialDatasetDetails) =>
      dispatch(updateFormState({ datasetDetails, ...fileUploads })),
    [dispatch, fileUploads]
  );

  return (
    <section className="relative-root">
      <div className="header-line">
        <h2>Provide Dataset Metadata:</h2>
        <DatasetFormButton onClick={openMetaImport} kind={ActionKind.Secondary}>
          Copy from existing dataset
        </DatasetFormButton>
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
