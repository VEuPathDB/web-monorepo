import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  EntityDiagram,
  SessionState,
  StudyEntity,
  StudyVariable,
  useStudyMetadata,
} from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { cx } from './Utils';
import { Variable } from './Variable';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { VariableTree } from '../core/components/VariableTree';
import FilterChipList from '../core/components/FilterChipList';
import { uniq } from 'lodash';

interface RouteProps {
  sessionState: SessionState;
  entityId?: string;
  variableId?: string;
}

export function SubsettingRoute(props: RouteProps) {
  const { variableId, entityId, sessionState } = props;
  const studyMetadata = useStudyMetadata();
  const history = useHistory();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const entity = entityId
    ? entities.find((e) => e.id === entityId)
    : entities[0];
  const variable =
    entity &&
    ((variableId && entity.variables.find((v) => v.id === variableId)) ||
      entity.variables.find((v) => v.dataShape != null));
  useEffect(() => {
    if (entity != null && variable != null) {
      if (entityId == null)
        history.replace(
          `${history.location.pathname}/${entity.id}/${variable.id}`
        );
      else if (variableId == null)
        history.replace(`${history.location.pathname}/${variable.id}`);
    }
  }, [entityId, variableId, entity, variable, history]);
  if (entity == null || variable == null)
    return <div>Could not find specified variable.</div>;
  // Prevent <Variables> from rendering multiple times
  if (entityId == null || variableId == null) return null;
  return (
    <Subsetting
      sessionState={sessionState}
      entity={entity}
      entities={entities}
      variable={variable}
    />
  );
}

interface Props {
  sessionState: SessionState;
  entity: StudyEntity;
  entities: StudyEntity[];
  variable: StudyVariable;
}

export function Subsetting(props: Props) {
  const { entity, entities, variable, sessionState } = props;
  const history = useHistory();
  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(sessionState.session?.filters);
  const totalEntityCount = totalCounts.value && totalCounts.value[entity.id];
  const filteredEntityCount =
    filteredCounts.value && filteredCounts.value[entity.id];
  const filteredEntities = uniq(
    sessionState.session?.filters.map((f) => f.entityId)
  );

  return (
    <div className={cx('-Subsetting')}>
      <div className="Entities">
        <EntityDiagram
          expanded
          orientation="horizontal"
          selectedEntity={entity.displayName}
          entityCounts={totalCounts.value}
          filteredEntityCounts={filteredCounts.value}
          filteredEntities={filteredEntities}
        />
      </div>
      <div className="Variables">
        <div
          style={{
            padding: '.5em',
            height: '60vh',
            width: '30em',
            position: 'relative',
          }}
        >
          <VariableTree
            entities={entities}
            entityId={entity.id}
            variableId={variable.id}
            onActiveFieldChange={(term?: string) => {
              if (term) history.replace(`../${term}`);
              else history.replace('`..');
            }}
          />
        </div>
      </div>
      <div className="EntityDetails">
        <h2>{entity.displayName}</h2>
        {filteredEntityCount && totalEntityCount && (
          <h3>
            {filteredEntityCount.toLocaleString()} of{' '}
            {totalEntityCount.toLocaleString()} (
            {(filteredEntityCount / totalEntityCount).toLocaleString('en-us', {
              style: 'percent',
            })}
            )
          </h3>
        )}
      </div>
      <div className="FilterChips">
        <FilterChipList
          filters={sessionState.session?.filters}
          setFilters={sessionState.setFilters}
          entities={entities}
          selectedEntityId={entity.id}
          selectedVariableId={variable.id}
        />
      </div>
      <div className="Filter">
        <Variable
          entity={entity}
          variable={variable}
          sessionState={sessionState}
          totalEntityCount={totalEntityCount}
          filteredEntityCount={filteredEntityCount}
        />
      </div>
    </div>
  );
}
