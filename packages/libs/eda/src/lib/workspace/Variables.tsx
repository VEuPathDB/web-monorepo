import React, { useEffect } from 'react';
import {
  StudyVariable,
  useSession,
  Distribution,
  useStudyMetadata,
  useSubsettingClient,
  StudyEntity,
} from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { startCase } from 'lodash';
import { cx } from './Utils';
import { usePromise } from '../core/hooks/promise';
import { useHistory } from 'react-router';

const variableKeys: (keyof StudyVariable)[] = [
  // 'displayName',
  'providerLabel',
  'type',
  'dataShape',
];

interface RouteProps {
  sessionId: string;
  entityId?: string;
  variableId?: string;
}
export function VariablesRoute(props: RouteProps) {
  const { variableId, entityId } = props;
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
    <Variables
      sessionId={props.sessionId}
      entity={entity}
      variable={variable}
    />
  );
}

interface Props {
  sessionId: string;
  entity: StudyEntity;
  variable: StudyVariable;
}

export function Variables(props: Props) {
  const { sessionId, entity, variable } = props;
  const studyMetadata = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  const history = useHistory();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const { session, setFilters } = useSession(sessionId);
  const entityCount = usePromise(
    () => subsettingClient.getEntityCount(studyMetadata.id, entity.id, []),
    [studyMetadata.id, entity]
  );
  const filteredCount = usePromise(async () => {
    if (session == null) return;
    return subsettingClient.getEntityCount(
      studyMetadata.id,
      entity.id,
      session?.filters ?? []
    );
  }, [studyMetadata.id, entity, session]);

  if (session == null) return null;

  return (
    <div className={cx('-Variables')}>
      <div style={{ margin: '.5em 0' }}>
        Select an entity:
        <select
          value={entity.id}
          onChange={(e) => {
            history.replace(e.currentTarget.value);
          }}
        >
          {entities.map((entity) => (
            <option value={`../${entity.id}/${entity.variables[0].id}`}>
              {entity.displayName}
            </option>
          ))}
        </select>
      </div>
      <div style={{ margin: '.5em 0' }}>
        Select a variable:
        <select
          value={variable.id}
          onChange={(e) => history.replace(e.currentTarget.value)}
        >
          {entity.variables.map(
            (variable) =>
              variable.dataShape && (
                <option value={variable.id}>
                  {variable.displayName} ({variable.dataShape} {variable.type})
                </option>
              )
          )}
        </select>
      </div>
      <div>
        <h3>Filters</h3>
        {session.filters ? (
          session.filters.map((f) => (
            <div>
              <button
                type="button"
                onClick={() =>
                  setFilters(session.filters.filter((_f) => _f !== f))
                }
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
            filters={session.filters}
            onFiltersChange={setFilters}
            studyMetadata={studyMetadata}
            entity={entity}
            variable={variable}
          />
        </div>
      </div>
    </div>
  );
}
