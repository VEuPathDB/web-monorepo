import { useStudyMetadata } from '../..';
import { useCollectionVariables } from '../../hooks/study';
import { ComputationAppOverview } from '../../types/visualization';

const defaultValues = {
  abundance: {
    name: 'RankedAbundanceComputation',
    method: 'median',
    methodPropertyName: 'rankingMethod',
  },
  alphadiv: {
    name: 'AlphaDivComputation',
    method: 'shannon',
    methodPropertyName: 'alphaDivMethod',
  },
};

export const useDefaultPluginConfiguration = (
  apps: ComputationAppOverview[]
) => {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  return apps.map((app) => {
    // @ts-ignore
    const defaultObject = defaultValues[app.name];
    if (!defaultObject) return null;
    return {
      name: app.name,
      displayName: `Data: ${collections[0].entityDisplayName}: ${collections[0].displayName}; Method: ${defaultObject.method}`,
      configuration: {
        name: defaultObject.name,
        collectionVariable: {
          variableId: collections[0].id,
          entityId: collections[0].entityId,
        },
        [defaultObject.methodPropertyName]: defaultObject.method,
      },
    };
  });
};
