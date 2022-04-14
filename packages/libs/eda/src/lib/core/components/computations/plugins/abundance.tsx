import React, { useState } from 'react';
import { useStudyMetadata } from '../../..';
import { useStudyEntities } from '../../../hooks/study';
import { VariableDescriptor } from '../../../types/variable';
import { findEntityAndVariable } from '../../../utils/study-metadata';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import {
  StudyMetadata,
  CollectionVariableTreeNode,
} from '../../../types/study';

export const plugin: ComputationPlugin = {
  configurationComponent: AbundanceConfiguration,
  visualizationTypes: {
    boxplot: boxplotVisualization,
    scatterplot: scatterplotVisualization,
  },
};

// Include available methods in this array.
const ABUNDANCE_METHODS = ['median', 'q3', 'variance', 'max'];

// Include known collection variables in this array.
// const studyMetadata = useStudyMetadata();

function variableDescriptorToString(
  variableDescriptor: VariableDescriptor
): string {
  return JSON.stringify(variableDescriptor);
}

export function AbundanceConfiguration(props: ComputationConfigProps) {
  const [name, setName] = useState('New ranked abundance app');
  const [rankingMethod, setRankingMethod] = useState(ABUNDANCE_METHODS[0]);
  const { computationAppOverview, addNewComputation } = props;
  const studyMetadata = useStudyMetadata();
  console.log(studyMetadata);
  console.log(studyMetadata.rootEntity);
  const entities = useStudyEntities(studyMetadata.rootEntity);
  function findCollections(studyMetadata: StudyMetadata) {
    console.log('hi ann');
  }
  const ABUNDANCE_COLLECTION_VARIABLES = [
    { entityId: 'EUPATH_0000808', variableId: 'EUPATH_0009253' },
    { entityId: 'EUPATH_0000808', variableId: 'EUPATH_0009251' },
  ];
  const [collectionVariable, setCollectionVariable] = useState(
    variableDescriptorToString(ABUNDANCE_COLLECTION_VARIABLES[0])
  );
  console.log(collectionVariable);

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
          {ABUNDANCE_COLLECTION_VARIABLES.map((collectionVar) => {
            const result = findEntityAndVariable(entities, collectionVar);
            return (
              result && (
                <option value={variableDescriptorToString(collectionVar)}>
                  {result.entity.displayName}: {result.variable.displayName}
                </option>
              )
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
