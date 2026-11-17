import React from 'react';
import { JsonPathBuilder, Runnable } from '../../../../Utils';
import { CoreDatasetInformation } from './Core';
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
}: MetadataSectionProps): React.ReactElement {
  return (
    <section className="relative-root">
      <div className="header-line">
        <h2>Provide Dataset Metadata:</h2>
        <SecondaryButton disabled={false} onClick={openMetaImport}>
          Copy from existing dataset
        </SecondaryButton>
      </div>

      <CoreDatasetInformation formProps={formProps} jsonPath={jsonPath} />

      <RecommendedInformation jsonPath={jsonPath} />
    </section>
  );
}
