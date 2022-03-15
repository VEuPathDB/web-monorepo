import React, { useState } from 'react';
import { useStudyMetadata } from '../../..';
import { useStudyEntities } from '../../../hooks/study';
import { VariableDescriptor } from '../../../types/variable';
import { findEntityAndVariable } from '../../../utils/study-metadata';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';

export const plugin: ComputationPlugin = {
  configurationComponent: AlphaDivConfiguration,
  visualizationTypes: {
    boxplot: boxplotVisualization,
    scatterplot: scatterplotVisualization,
  },
};

// Include available methods in this array.
const ALPHA_DIV_METHODS = ['shannon', 'simpson', 'evenness'];

// Include known collection variables in this array.
const ALPHA_DIV_COLLECTION_VARIABLES = [
  { entityId: 'EUPATH_0000808', variableId: 'EUPATH_0009253' },
];

function variableDescriptorToString(
  variableDescriptor: VariableDescriptor
): string {
  return JSON.stringify(variableDescriptor);
}

export function AlphaDivConfiguration(props: ComputationConfigProps) {
  const [name, setName] = useState('New boxplot app');
  const [collectionVariable, setCollectionVariable] = useState(
    variableDescriptorToString(ALPHA_DIV_COLLECTION_VARIABLES[0])
  );
  const [alphaDivMethod, setAlphaDivMethod] = useState(ALPHA_DIV_METHODS[0]);
  const { computationAppOverview, addNewComputation } = props;
  const study = useStudyMetadata();
  const entities = useStudyEntities(study.rootEntity);

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
          {ALPHA_DIV_COLLECTION_VARIABLES.map((collectionVar) => {
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
          value={alphaDivMethod}
          onChange={(e) => setAlphaDivMethod(e.target.value)}
        >
          {ALPHA_DIV_METHODS.map((method) => (
            <option value={method}>{method}</option>
          ))}
        </select>
        <div>
          <button
            type="button"
            onClick={() =>
              addNewComputation(name, {
                name: 'AlphaDivComputation',
                collectionVariable: JSON.parse(collectionVariable),
                alphaDivMethod,
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
