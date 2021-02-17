import React, { useState } from 'react';
import {
  StudyVariable,
  useSession,
  useEdaApi,
  useStudy,
  Distribution,
} from '@veupathdb/eda-workspace-core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { startCase } from 'lodash';
import { cx } from './Utils';
import { usePromise } from '@veupathdb/eda-workspace-core/lib/hooks/usePromise';

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
  const edaApi = useEdaApi();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const {
    history: { current: session },
    setFilters,
  } = useSession();
  const entity = entities[selectedEntity];
  const variable = entity.variables[selectedVariable];
  const filters = session?.filters ?? [];
  const entityCount = usePromise(
    () => edaApi.getEntityCount(studyMetadata.id, entity.id, []),
    [studyMetadata.id, entity.id]
  );
  const filteredCount = usePromise(
    () => edaApi.getEntityCount(studyMetadata.id, entity.id, filters),
    [studyMetadata.id, entity.id, filters]
  );

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
          {entity.variables.map(
            (variable, idx) =>
              variable.dataShape && (
                <option value={idx}>
                  {variable.displayName} ({variable.dataShape} {variable.type})
                </option>
              )
          )}
        </select>
      </div>
      <div>
        <h3>Filters</h3>
        {filters ? (
          filters.map((f) => (
            <div>
              <button
                type="button"
                onClick={() => setFilters(filters.filter((_f) => _f !== f))}
              >
                Remove
              </button>
              <code>{JSON.stringify(f)}</code>
            </div>
          ))
        ) : (
          <div>
            <i>No filters</i>
          </div>
        )}
      </div>
      <div>
        <h3>
          {entity.displayName} ({filteredCount.value?.count.toLocaleString()} of{' '}
          {entityCount.value?.count.toLocaleString()})
        </h3>
        <h4>{variable.displayName}</h4>
        <dl>
          {variableKeys.map((key) => (
            <div>
              <dt>{startCase(key)}</dt>
              <dd>{variable[key]}</dd>
            </div>
          ))}
        </dl>
        <h4>Distribution</h4>
        <div className="filter-param">
          <Distribution
            studyMetadata={studyMetadata}
            entity={entity}
            variable={variable}
          />
        </div>
      </div>
    </div>
  );
}
