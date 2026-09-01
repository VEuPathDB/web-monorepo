import React, { ReactElement } from 'react';
import { CollaboratorsSection } from './Collaborators/CollaboratorsSection';
import { PartialDatasetDetails } from '../../../../../Service';
import { CharacteristicsSection } from './CharacteristicsSection';
import { DatasetSources } from './DatasetSources';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetUsage } from './DatasetUsage';
import { ExperimentalOrganism } from './ExperimentalOrganism';
import { DatasetFormProps } from '../../../DatasetFormProps';
import { PublicationsSection } from './Publications/PublicationsSection';

export interface CoreDatasetInformationProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly jsonPath: JsonPathBuilder;
  readonly formProps: DatasetFormProps;
}

export function CoreDatasetInformation({
  datasetMeta,
  setDatasetMeta,
  jsonPath,
  formProps: { formConfig },
}: CoreDatasetInformationProps): ReactElement {
  return (
    <>
      <h3>Core Dataset Information</h3>
      <p className="section-description">
        This Core Dataset Information must be completed before you can make this
        dataset public. If you choose to not provide it, you will still be able
        to upload the dataset for private use (including personal exploration
        and sharing with selected collaborators).
      </p>

      <CollaboratorsSection
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        pathBuilder={jsonPath.append<PartialDatasetDetails>('contacts')}
      />

      {formConfig.datasetCharacteristics?.enable && (
        <CharacteristicsSection
          formProps={formConfig.datasetCharacteristics}
          datasetMeta={datasetMeta}
          setDatasetMeta={setDatasetMeta}
          pathBuilder={jsonPath.append<PartialDatasetDetails>(
            'datasetCharacteristics'
          )}
        />
      )}

      {formConfig.enableExperimentalOrganism && (
        <ExperimentalOrganism
          setDatasetDetails={setDatasetMeta}
          datasetMeta={datasetMeta}
          jsonPath={jsonPath.append<PartialDatasetDetails>(
            'experimentalOrganism'
          )}
        />
      )}

      <PublicationsSection
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        publications={datasetMeta.publications ?? []}
        setPublications={(v) =>
          setDatasetMeta({
            ...datasetMeta,
            publications: v,
          })
        }
        isRequired={
          false /* TODO: when vdi backend tracks this, use that value from the metadata*/
        }
        jsonPath={jsonPath.append<PartialDatasetDetails>('publications')}
      />

      <DatasetSources
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        jsonPath={jsonPath.append<PartialDatasetDetails>('datasetSources')}
      />

      <DatasetUsage
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        jsonPath={jsonPath}
      />
    </>
  );
}
