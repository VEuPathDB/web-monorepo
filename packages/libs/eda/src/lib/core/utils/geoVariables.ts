import { StudyEntity, Variable, VariableTreeNode } from '../types/study';

/**
 * Given a study, search its variable tree to find a node that has the following direct children
 *
 * a longitude variable
 * a number variable
 * six string categorical variables
 * and nothing more!
 *
 * returns the VariableTreNode or null
 *
 * This is a placeholder implementation, until more direct variable annotations (displayType) are available for b57
 */
export function findGeolocationNode(
  entity: StudyEntity
): VariableTreeNode | undefined {
  // first find the longitude variable
  const longitudeVariables = entity.variables.filter(
    (variable) => variable.type === 'longitude'
  );
  if (longitudeVariables.length === 1) {
    const longitudeVariable = longitudeVariables[0];
    const siblingVariables = entity.variables.filter(
      (variable) => variable.parentId === longitudeVariable.parentId
    );
    const numberSiblings = siblingVariables.filter(
      (variable) => variable.type === 'number'
    );
    if (numberSiblings.length === 1) {
      const stringCategoricals = siblingVariables.filter(
        (variable) =>
          variable.type === 'string' &&
          (variable.dataShape === 'categorical' ||
            variable.dataShape === 'binary')
        // two lines above, it wouldn't let me do ({ type, dataShape}) => ...
        // without jumping through more typing hoops - any idea why please?
      );

      if (stringCategoricals.length === 6) {
        return entity.variables.find(
          (variable) => variable.id === longitudeVariable.parentId
        );
      }
    }
  }
  return undefined;
}
