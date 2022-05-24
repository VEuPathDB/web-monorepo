import { useMemo } from 'react';
import { useStudyMetadata } from '../..';
import { useCollectionVariables } from '../../hooks/study';
import { Computation } from '../../types/visualization';

export function useAppPropertiesForDisplay(
  computation: Computation | undefined
) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  return useMemo(() => {
    if (computation && !computation.descriptor.configuration) return;
    const appType = computation?.descriptor.type;
    const displayProperties = collections
      .filter(
        (collection) =>
          collection.id ===
          // @ts-ignore
          computation?.descriptor.configuration.collectionVariable.variableId
      )
      .map((varProperties) => ({
        params:
          varProperties.entityDisplayName + ': ' + varProperties.displayName,
        // @ts-ignore
        method:
          appType === 'alphadiv'
            ? // @ts-ignore
              computation?.descriptor.configuration.alphaDivMethod
            : // @ts-ignore
              computation?.descriptor.configuration.rankingMethod,
      }));
    return `Data: ${displayProperties[0].params}, Method: ${displayProperties[0].method}`;
  }, [computation, collections]);
}
