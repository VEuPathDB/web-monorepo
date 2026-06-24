import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetInformationSection } from './DatasetInformationSection';

export interface RecommendedInformationProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function RecommendedInformation(
  props: RecommendedInformationProps
): ReactElement {
  return (
    <>
      <h3>Recommended Information:</h3>
      <p>
        <i>
          Providing this information is recommended, as it will helps others
          understand, interpret, and reuse your dataset.
        </i>
      </p>

      <DatasetInformationSection {...props} />
    </>
  );
}
