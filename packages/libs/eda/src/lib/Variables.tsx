import React, { useState } from 'react';
import { StudyVariable, useStudy } from '@veupathdb/eda-workspace-core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { startCase } from 'lodash';
import { cx } from './Utils';

const variableKeys: (keyof StudyVariable)[] = [
  // 'displayName',
  'providerLabel',
  'type',
  'dataShape',
];

export function Variables() {
  const [selectedEntity, setSelectedEntity] = useState<number>(0);
  const [selectedVariable, setSelectedVariable] = useState<number>(0);
  const { studyMetadata } = useStudy();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const entity = entities[selectedEntity];
  const variable = entity.variables[selectedVariable];

  return (
    <div className={cx('-Variables')}>
      <div style={{ margin: '.5em 0' }}>
        Select an entity:
        <select
          value={selectedEntity}
          onChange={(e) => {
            setSelectedEntity(Number(e.target.value));
            setSelectedVariable(0);
          }}
        >
          {entities.map((entity, idx) => (
            <option value={idx}>{entity.displayName}</option>
          ))}
        </select>
      </div>
      <div style={{ margin: '.5em 0' }}>
        Select a variable:
        <select
          value={selectedVariable}
          onChange={(e) => setSelectedVariable(Number(e.target.value))}
        >
          {entity.variables.map((variable, idx) => (
            <option value={idx}>{variable.displayName}</option>
          ))}
        </select>
      </div>
      <div>
        <h3>{entity.displayName}</h3>
        <h4>{variable.displayName}</h4>
        <dl>
          {variableKeys.map((key) => (
            <div>
              <dt>{startCase(key)}</dt>
              <dd>{variable[key]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
