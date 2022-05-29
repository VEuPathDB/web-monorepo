import { useState, useMemo } from 'react';
import { useStudyMetadata } from '../../..';
import { useCollectionVariables } from '../../../hooks/study';
import { VariableDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { H6 } from '@veupathdb/coreui';

export const plugin: ComputationPlugin = {
  configurationComponent: AbundanceConfiguration,
  visualizationTypes: {
    boxplot: boxplotVisualization,
    scatterplot: scatterplotVisualization,
  },
};

// Include available methods in this array.
const ABUNDANCE_METHODS = ['median', 'q3', 'variance', 'max'];

function variableDescriptorToString(
  variableDescriptor: VariableDescriptor
): string {
  return JSON.stringify(variableDescriptor);
}

export function AbundanceConfiguration(props: ComputationConfigProps) {
  const [rankingMethod, setRankingMethod] = useState(ABUNDANCE_METHODS[0]);
  const { computationAppOverview, addNewComputation } = props;
  const studyMetadata = useStudyMetadata();
  // Include known collection variables in this array.
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  const [collectionVariable, setCollectionVariable] = useState(
    variableDescriptorToString({
      variableId: collections[0].id,
      entityId: collections[0].entityId,
    })
  );

  const configDescription = useMemo(() => {
    if (!collections.length || !collectionVariable) return '';
    const variableObject = collections.find(
      (collectionVar) =>
        variableDescriptorToString({
          variableId: collectionVar.id,
          entityId: collectionVar.entityId,
        }) === collectionVariable
    );
    return `Data: ${variableObject?.entityDisplayName}: ${variableObject?.displayName}; Method: ${rankingMethod}`;
  }, [collections, collectionVariable, rankingMethod]);

  return (
    <div style={{ display: 'flex', gap: '0 2em', padding: '1em 0' }}>
      <H6 additionalStyles={{ margin: 0 }}>
        {computationAppOverview.displayName[0].toUpperCase() +
          computationAppOverview.displayName.substring(1).toLowerCase() +
          ' parameters:'}
      </H6>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '.5em 1em',
          width: '800px',
          justifyItems: 'start',
          alignItems: 'center',
        }}
      >
        <div style={{ justifySelf: 'end' }}>Data: </div>
        <select
          value={collectionVariable}
          onChange={(e) => setCollectionVariable(e.target.value)}
        >
          {collections.map((collectionVar) => {
            return (
              <option
                value={variableDescriptorToString({
                  variableId: collectionVar.id,
                  entityId: collectionVar.entityId,
                })}
              >
                {collectionVar.entityDisplayName}: {collectionVar.displayName}
              </option>
            );
          })}
        </select>
        <div style={{ justifySelf: 'end' }}>Method: </div>
        <select
          value={rankingMethod}
          onChange={(e) => setRankingMethod(e.target.value)}
        >
          {ABUNDANCE_METHODS.map((method) => (
            <option value={method}>{method}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
