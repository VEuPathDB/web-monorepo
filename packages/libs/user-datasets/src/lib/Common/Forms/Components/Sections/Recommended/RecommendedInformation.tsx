import React from 'react';

import { JsonPathBuilder } from '../../../../../Utils';
import { DatasetInformationSection } from './DatasetInformationSection';

export interface RecommendedInformationProps {
  readonly jsonPath: JsonPathBuilder;
}

export function RecommendedInformation(props: RecommendedInformationProps): React.ReactElement {
  return (
    <>
      <h3>Recommended Information</h3>
      <p className="section-description">
        <i>
          Providing this information is recommended, as it will helps others
          understand, interpret, and reuse your dataset.
        </i>
      </p>

      <DatasetInformationSection {...props} />
    </>
  );
}
