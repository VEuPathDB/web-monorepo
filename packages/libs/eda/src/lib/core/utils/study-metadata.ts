import { find } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { StudyEntity, StudyVariableVariable } from '../types/study';
import { Variable } from '../types/variable';

export interface EntityAndVariable {
  entity: StudyEntity;
  variable: StudyVariableVariable;
}

export function findEntityAndVariable(
  entities: Iterable<StudyEntity>,
  variableDescriptor?: Variable
): EntityAndVariable | undefined {
  if (variableDescriptor == null) return undefined;
  const entity = find(
    (entity) => entity.id === variableDescriptor.entityId,
    entities
  );
  const variable =
    entity &&
    find(
      (variable) => variable.id === variableDescriptor.variableId,
      entity.variables
    );
  if (entity == null || variable == null || variable.type === 'category')
    return undefined;
  return { entity, variable };
}
