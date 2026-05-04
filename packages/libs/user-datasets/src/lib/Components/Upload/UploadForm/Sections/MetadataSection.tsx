import { ReactElement } from 'react';
import { UploadFormProps } from '../UploadForm';
import { DatasetPostDetails } from "../../../../Service";
import { Consumer, JsonPathBuilder } from '../../../../Utils';
import { CoreDatasetInformation } from "./Core";

export interface MetadataSectionProps {
  readonly formProps: UploadFormProps;
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function MetadataSection({
  formProps,
  datasetMeta,
  setDatasetMeta,
  jsonPath,
}: MetadataSectionProps): ReactElement {
  return (
    <section className="relative-root">
      <h2>
        {formProps.verbiage.metadataSectionTitle ?? 'Provide Dataset Metadata:'}
      </h2>
      <ImportMetaButton />

      <CoreDatasetInformation
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        jsonPath={jsonPath}
      />


    </section>
  );
}

function ImportMetaButton(): ReactElement {
  return <button>Import from Existing Dataset</button>;
}
