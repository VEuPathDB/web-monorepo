import React from 'react';
import { CollaboratorsSection } from './Collaborators/CollaboratorsSection';
import { CharacteristicsSection } from './CharacteristicsSection';
import { DatasetSources } from './DatasetSources';
import { JsonPathBuilder } from '../../../../../Utils';
import { DatasetUsage } from './DatasetUsage';
import { DatasetFormProps } from '../../../DatasetFormProps';
import { PublicationsSection } from './Publications/PublicationsSection';
import { ExperimentalOrganisms } from './ExperimentalOrganisms';

export interface CoreDatasetInformationProps {
  readonly jsonPath: JsonPathBuilder;
  readonly formProps: DatasetFormProps;
}

export function CoreDatasetInformation({
  jsonPath,
  formProps: { formConfig },
}: CoreDatasetInformationProps): React.ReactElement {
  return (
    <>
      <h3>Core Dataset Information</h3>
      <p className="section-description">
        This Core Dataset Information must be completed before you can make this
        dataset public. If you choose to not provide it, you will still be able
        to upload the dataset for private use (including personal exploration
        and sharing with selected collaborators).
      </p>

      <CollaboratorsSection pathBuilder={jsonPath} />

      {formConfig.datasetCharacteristics?.enable && (
        <CharacteristicsSection
          formProps={formConfig.datasetCharacteristics}
          pathBuilder={jsonPath}
        />
      )}

      {formConfig.enableExperimentalOrganism && (
        <ExperimentalOrganisms jsonPath={jsonPath} />
      )}

      <PublicationsSection jsonPath={jsonPath}/>
      <DatasetSources jsonPath={jsonPath} />
      <DatasetUsage jsonPath={jsonPath} />
    </>
  );
}
