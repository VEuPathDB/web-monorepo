import { ReactElement } from 'react';
import { DatasetPostDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetInformationSection } from './DatasetInformationSection';

export interface RecommendedInformationProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function RecommendedInformation(
  props: RecommendedInformationProps
): ReactElement {
  return (
    <>
      <h3 style={{ marginTop: '1em'}}>Recommended Information</h3>
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
