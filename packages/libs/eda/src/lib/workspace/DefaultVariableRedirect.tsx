import { useStudyMetadata } from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { Redirect, useRouteMatch } from 'react-router';
import { findFirstVariable } from './Utils';

interface Props {
  entityId?: string;
}

export function DefaultVariableRedirect(props: Props) {
  const { entityId } = props;
  const { url } = useRouteMatch();
  const studyMetadata = useStudyMetadata();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const entity = entityId
    ? entities.find((e) => e.id === entityId)
    : entities[0];
  const variable = entity && findFirstVariable(entity.variables);
  if (entity == null || variable == null)
    return <div>Could not find specified variable.</div>;
  // Prevent <Variables> from rendering multiple times
  const path = entityId
    ? `${url}/${variable.id}`
    : `${url}/${entity.id}/${variable.id}`;
  return <Redirect to={path} />;
}
