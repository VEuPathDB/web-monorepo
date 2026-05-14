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
      <DatasetInformationSection {...props} />
    </>
  );
}
