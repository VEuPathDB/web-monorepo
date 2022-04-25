import React, { useState } from 'react';
import { useStudyMetadata } from '../../..';
import { useFlattenedCollectionVariables } from '../../../hooks/study';
import { VariableDescriptor } from '../../../types/variable';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';

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
  const [name, setName] = useState('New ranked abundance tool');
  const [rankingMethod, setRankingMethod] = useState(ABUNDANCE_METHODS[0]);
  const { computationAppOverview, addNewComputation } = props;
  const studyMetadata = useStudyMetadata();
  // Include known collection variables in this array.
  const collections = useFlattenedCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  const [collectionVariable, setCollectionVariable] = useState(
    variableDescriptorToString({
      variableId: collections[0].id,
      entityId: collections[0].entityId,
    })
  );

  return (
    <div style={{ padding: '1em 0' }}>
      <h1>{computationAppOverview.displayName}</h1>
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
        <label style={{ justifySelf: 'end' }}>Name: </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div style={{ justifySelf: 'end' }}>Collection variable: </div>
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
        <div>
          <button
            type="button"
            onClick={() =>
              addNewComputation(name, {
                name: 'RankedAbundanceComputation',
                collectionVariable: JSON.parse(collectionVariable),
                rankingMethod,
              })
            }
          >
            Add app
          </button>
        </div>
      </div>
    </div>
  );
}
