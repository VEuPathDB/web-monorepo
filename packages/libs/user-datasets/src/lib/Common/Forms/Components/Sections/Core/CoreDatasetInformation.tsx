import React, { ReactElement } from 'react';
import { CollaboratorsSection } from './Collaborators/CollaboratorsSection';
import { PartialDatasetDetails } from '../../../../../Service';
import { CharacteristicsSection } from './CharacteristicsSection';
import { DatasetSources } from './DatasetSources';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetUsage } from './DatasetUsage';
import { ClientSideUploadFormState } from '../../../../../StoreModules';
import { ExperimentalOrganism } from './ExperimentalOrganism';
import { DatasetFormProps } from '../../../DatasetFormProps';

export interface CoreDatasetInformationProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly jsonPath: JsonPathBuilder;
  readonly formProps: DatasetFormProps;
}

export function CoreDatasetInformation({
  datasetMeta,
  setDatasetMeta,
  clientSideState,
  setClientSideState,
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
          clientSideState={clientSideState}
          setClientSideState={setClientSideState}
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
          clientSideState={clientSideState}
          setClientSideState={setClientSideState}
        />
      )}

      <DatasetSources
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        clientState={clientSideState}
        setClientState={setClientSideState}
        jsonPath={jsonPath.append<PartialDatasetDetails>('datasetSources')}
      />

      <DatasetUsage
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        clientSideState={clientSideState}
        setClientSideState={setClientSideState}
        jsonPath={jsonPath}
      />
    </>
  );
}
