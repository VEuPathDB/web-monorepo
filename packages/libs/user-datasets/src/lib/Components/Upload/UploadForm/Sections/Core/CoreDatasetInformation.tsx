import { ReactElement } from "react";
import { CollaboratorsSection } from "./CollaboratorsSection";
import { DatasetPostDetails } from "../../../../../Service";
import { CharacteristicsSection } from "./CharacteristicsSection";
import { DatasetSources } from "./DatasetSources";
import { Consumer, JsonPathBuilder } from "../../../../../Utils";
import { DatasetUsage } from "./DatasetUsage";

export interface CoreDatasetInformationProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function CoreDatasetInformation({
  datasetMeta,
  setDatasetMeta,
  jsonPath
}: CoreDatasetInformationProps): ReactElement {
  return (
    <>

      <CollaboratorsSection
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        pathBuilder={jsonPath.append<DatasetPostDetails>('contacts')}
      />

      <CharacteristicsSection
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        pathBuilder={jsonPath.append<DatasetPostDetails>(
          'datasetCharacteristics'
        )}
      />

      <DatasetSources
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        jsonPath={jsonPath.append<DatasetPostDetails>('datasetSources')}
      />

      <DatasetUsage
        datasetMeta={datasetMeta}
        setDatasetMeta={setDatasetMeta}
        jsonPath={jsonPath}
      />
    </>
  );
}