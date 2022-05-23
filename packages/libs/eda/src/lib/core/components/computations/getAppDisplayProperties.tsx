import { useMemo } from 'react';
import { useStudyMetadata } from '../..';
import { useCollectionVariables } from '../../hooks/study';
import { Computation } from '../../types/visualization';

const ABUNDANCE_METHODS = ['median', 'q3', 'variance', 'max'];
const ALPHA_DIV_METHODS = ['shannon', 'simpson', 'evenness'];

export function useAppPropertiesForDisplay(
  computation: Computation | undefined
) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  return useMemo(() => {
    if (computation && !computation.descriptor.configuration) return;
    const displayProperties = collections
      .filter(
        // @ts-ignore
        (collection) =>
          collection.id ===
          computation?.descriptor.configuration.collectionVariable.variableId
      )
      .map((varProperties) => ({
        displayName:
          varProperties.entityDisplayName + ': ' + varProperties.displayName,
        // @ts-ignore
        method: computation?.descriptor.configuration.method,
      }));
    return displayProperties[0];
  }, [computation, collections]);
}
