import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetInformationSection } from './DatasetInformationSection';
import { PublicationsSection } from './PublicationsSection';

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
      <h3 style={{ marginTop: '1em'}}>Recommended Information</h3>
      <p className="section-description">
        <i>
          Providing this information is recommended, as it will helps others
          understand, interpret, and reuse your dataset.
        </i>
      </p>

      <PublicationsSection
        publications={props.datasetMeta.publications ?? []}
        setPublications={v => props.setDatasetMeta({
          ...props.datasetMeta, publications: v
        })}
        isRequired={false /* TODO: when vdi backend tracks this, use that value from the metadata*/}
        jsonPath={props.jsonPath.append<PartialDatasetDetails>('publications')}
      />

      <DatasetInformationSection {...props} />
    </>
  );
}
