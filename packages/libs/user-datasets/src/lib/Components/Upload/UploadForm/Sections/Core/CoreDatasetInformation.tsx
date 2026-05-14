import { ReactElement } from 'react';
import { CollaboratorsSection } from './CollaboratorsSection';
import { DatasetPostDetails } from '../../../../../Service';
import { CharacteristicsSection } from './CharacteristicsSection';
import { DatasetSources } from './DatasetSources';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetUsage } from './DatasetUsage';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';
import { UploadFormProps } from '../../UploadForm';

export interface CoreDatasetInformationProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly jsonPath: JsonPathBuilder;
  readonly formProps: UploadFormProps;
}

export function CoreDatasetInformation({
  datasetMeta,
  setDatasetMeta,
  clientSideState,
  setClientSideState,
  jsonPath,
  formProps,
}: CoreDatasetInformationProps): ReactElement {
  return (
    <>
      <CollaboratorsSection
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        pathBuilder={jsonPath.append<DatasetPostDetails>('contacts')}
      />

      {formProps.datasetCharacteristics?.enable && (
        <CharacteristicsSection
          formProps={formProps.datasetCharacteristics}
          datasetMeta={datasetMeta}
          setDatasetMeta={setDatasetMeta}
          clientSideState={clientSideState}
          setClientSideState={setClientSideState}
          pathBuilder={jsonPath.append<DatasetPostDetails>(
            'datasetCharacteristics'
          )}
        />
      )}

      <DatasetSources
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        clientSideState={clientSideState}
        setClientSideState={setClientSideState}
        jsonPath={jsonPath.append<DatasetPostDetails>('datasetSources')}
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
