import { useStudyMetadata } from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { Redirect, useRouteMatch } from 'react-router';

export function DefaultVariableRedirect() {
  const { url } = useRouteMatch();
  const studyMetadata = useStudyMetadata();
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );
  const entity = entities[0];
  const variable = entity && entity.variables.find((v) => v.dataShape != null);
  if (entity == null || variable == null)
    return <div>Could not find specified variable.</div>;
  // Prevent <Variables> from rendering multiple times
  return <Redirect to={`${url}/${entity.id}/${variable.id}`} />;
}
