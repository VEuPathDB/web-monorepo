import { Redirect, useRouteMatch } from 'react-router';
import { findFirstVariable } from './Utils';
import {
  useFeaturedFieldsFromTree,
  useFieldTree,
  useFlattenedFields,
} from '../core/components/variableTrees/hooks';
import { useStudyEntities } from '../core/hooks/workspace';

interface Props {
  entityId?: string;
}

export function DefaultVariableRedirect(props: Props) {
  const { entityId } = props;
  const { url } = useRouteMatch();
  const entities = useStudyEntities();
  const flattenedFields = useFlattenedFields(entities, 'variableTree');
  const fieldTree = useFieldTree(flattenedFields);
  const featuredFields = useFeaturedFieldsFromTree(fieldTree);

  let finalEntityId: string | undefined, finalVariableId: string | undefined;

  if (entityId || featuredFields.length === 0) {
    // Use the first variable in the entity
    const entity = entityId
      ? entities.find((e) => e.id === entityId)
      : entities[0];
    finalEntityId = entity?.id;
    finalVariableId =
      entity &&
      findFirstVariable(fieldTree, entity.id)?.field.term.split('/')[1];
  } else {
    // Use the first featured variable
    [finalEntityId, finalVariableId] = featuredFields[0].term.split('/');
  }

  if (!finalEntityId || !finalVariableId)
    return <div>Could not find specified variable.</div>;
  // Prevent <Variables> from rendering multiple times
  const path = entityId
    ? `${url}/${finalVariableId}`
    : `${url}/${finalEntityId}/${finalVariableId}`;
  return <Redirect to={path} />;
}
