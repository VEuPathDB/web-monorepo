import { useMemo } from 'react';
import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import {
  DataElementConstraintRecord,
  excludedVariables,
  flattenConstraints,
  VariablesByInputName,
} from '../../utils/data-element-constraints';

import VariableTreeDropdown from '../variableTrees/VariableTreeDropdown';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import { makeEntityDisplayName } from '../../utils/study-metadata';
import { useInputStyles } from './inputStyles';

export interface InputSpec {
  name: string;
  label: string;
  role: 'primary' | 'stratification';
  /** Provide a string here to indicate that the input is readonly.
   * The string will be displayed instead of a variable selector.
   */
  readonlyValue?: string;
}

export interface Props {
  /**
   * This defines the order the variables appear, and the names associated with
   * their selectedVariable. If the name properties exist in `constraints`, the
   * associated constraint will be applied.
   */
  inputs: InputSpec[];
  /**
   * Study entities used to look up entity and variable details.
   */
  entities: StudyEntity[];
  /**
   * Current set of selectedVariables for `inputs`.
   * In other words, the currently selected variables.
   */
  selectedVariables: VariablesByInputName;
  /**
   * Change handler that is called when any input value is changed.
   */
  onChange: (selectedVariables: VariablesByInputName) => void;
  /**
   * Constraints to apply to `inputs`
   */
  constraints?: DataElementConstraintRecord[];
  /**
   * Order in which to apply entity-specific relationships between inputs.
   * The entity of a given element in the array must be of the same entity, or
   * lower in the tree, of the element to its right.
   */
  dataElementDependencyOrder?: string[];
  /**
   * An array of VariableDescriptors for the user's "My Variables"
   */
  starredVariables: VariableDescriptor[];
  /**
   * A callback for toggling the starred state of a variable
   */
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  /** When false, disable (gray out) the showMissingness toggle */
  enableShowMissingnessToggle?: boolean;
  /** controlled state of stratification variables' showMissingness toggle switch (optional) */
  showMissingness?: boolean;
  /** handler for showMissingness state change */
  onShowMissingnessChange?: (newState: boolean) => void;
  /** output entity, required for toggle switch label */
  outputEntity?: StudyEntity;
}

export function InputVariables(props: Props) {
  const {
    inputs,
    entities,
    selectedVariables,
    onChange,
    constraints,
    dataElementDependencyOrder,
    starredVariables,
    toggleStarredVariable,
    enableShowMissingnessToggle = false,
    showMissingness,
    onShowMissingnessChange,
    outputEntity,
  } = props;
  const classes = useInputStyles();
  const handleChange = (
    inputName: string,
    selectedVariable?: VariableDescriptor
  ) => {
    onChange({ ...selectedVariables, [inputName]: selectedVariable });
  };
  const flattenedConstraints =
    constraints && flattenConstraints(selectedVariables, entities, constraints);

  // Find entities that are excluded for each variable, and union their variables
  // with the disabled variables.
  const disabledVariablesByInputName: Record<
    string,
    VariableDescriptor[]
  > = useMemo(
    () =>
      inputs.reduce((map, input) => {
        const disabledVariables = excludedVariables(
          entities[0],
          flattenedConstraints && flattenedConstraints[input.name]
        );
        if (dataElementDependencyOrder == null) {
          map[input.name] = disabledVariables;
          return map;
        }
        const index = dataElementDependencyOrder.indexOf(input.name);
        // no change if dependencyOrder is not declared
        if (index === -1) {
          map[input.name] = disabledVariables;
          return map;
        }

        const prevSelectedVariable = dataElementDependencyOrder
          .slice(0, index)
          .map((n) => selectedVariables[n])
          .reverse()
          .find((v) => v != null);
        const nextSelectedVariable = dataElementDependencyOrder
          .slice(index + 1)
          .map((n) => selectedVariables[n])
          .find((v) => v != null);

        // Remove variables for entities which are not part of the ancestor path of, or equal to, `prevSelectedVariable`
        if (prevSelectedVariable) {
          const ancestors = entities.reduceRight((ancestors, entity) => {
            if (
              entity.id === prevSelectedVariable.entityId ||
              entity.children?.includes(ancestors[0])
            ) {
              ancestors.unshift(entity);
            }
            return ancestors;
          }, [] as StudyEntity[]);
          const excludedEntities = entities.filter(
            (entity) => !ancestors.includes(entity)
          );
          const excludedVariables = excludedEntities.flatMap((entity) =>
            entity.variables.map((variable) => ({
              variableId: variable.id,
              entityId: entity.id,
            }))
          );
          disabledVariables.push(...excludedVariables);
        }

        // Remove variables for entities which are not descendants of, or equal to, `nextSelectedVariable`
        if (nextSelectedVariable) {
          const entity = entities.find(
            (entity) => entity.id === nextSelectedVariable.entityId
          );
          if (entity == null)
            throw new Error('Unkonwn entity: ' + nextSelectedVariable.entityId);
          const descendants = Array.from(
            preorder(entity, (entity) => entity.children ?? [])
          );
          const excludedEntities = entities.filter(
            (entity) => !descendants.includes(entity)
          );
          const excludedVariables = excludedEntities.flatMap((entity) =>
            entity.variables.map((variable) => ({
              variableId: variable.id,
              entityId: entity.id,
            }))
          );
          disabledVariables.push(...excludedVariables);
        }

        map[input.name] = disabledVariables;
        return map;
      }, {} as Record<string, VariableDescriptor[]>),
    [
      dataElementDependencyOrder,
      entities,
      flattenedConstraints,
      inputs,
      selectedVariables,
    ]
  );

  const spanStyles = {
    height: '32px',
    lineHeight: '32px',
  };

  return (
    <div>
      <div className={classes.inputs}>
        {inputs.filter((input) => input.role === 'primary').length > 0 && (
          <div className={classes.inputGroup}>
            <div className={classes.fullRow}>
              <h4>Axis variables</h4>
            </div>
            {inputs
              .filter((input) => input.role === 'primary')
              .map((input) => (
                <div
                  key={input.name}
                  className={[classes.input, 'primary'].join(' ')}
                >
                  <div className={classes.label}>
                    {input.label + (input.readonlyValue ? ' (fixed)' : '')}
                  </div>
                  {!input.readonlyValue ? (
                    <VariableTreeDropdown
                      scope="variableTree"
                      showMultiFilterDescendants
                      rootEntity={entities[0]}
                      disabledVariables={
                        disabledVariablesByInputName[input.name]
                      }
                      customDisabledVariableMessage={
                        flattenedConstraints?.[input.name].description
                      }
                      starredVariables={starredVariables}
                      toggleStarredVariable={toggleStarredVariable}
                      entityId={selectedVariables[input.name]?.entityId}
                      variableId={selectedVariables[input.name]?.variableId}
                      onChange={(variable) => {
                        handleChange(input.name, variable);
                      }}
                    />
                  ) : (
                    <span style={spanStyles}>{input.readonlyValue}</span>
                  )}
                </div>
              ))}
          </div>
        )}
        {inputs.filter((input) => input.role === 'stratification').length >
          0 && (
          <div className={classes.inputGroup}>
            <div className={classes.fullRow}>
              <h4>Stratification variables (optional)</h4>
            </div>
            {inputs
              .filter((input) => input.role === 'stratification')
              .map((input) => (
                <div
                  key={input.name}
                  className={[classes.input, 'stratification'].join(' ')}
                >
                  <div className={classes.label}>
                    {input.label + (input.readonlyValue ? ' (fixed)' : '')}
                  </div>
                  {!input.readonlyValue ? (
                    <VariableTreeDropdown
                      scope="variableTree"
                      showMultiFilterDescendants
                      rootEntity={entities[0]}
                      disabledVariables={
                        disabledVariablesByInputName[input.name]
                      }
                      customDisabledVariableMessage={
                        flattenedConstraints?.[input.name].description
                      }
                      starredVariables={starredVariables}
                      toggleStarredVariable={toggleStarredVariable}
                      entityId={selectedVariables[input.name]?.entityId}
                      variableId={selectedVariables[input.name]?.variableId}
                      onChange={(variable) => {
                        handleChange(input.name, variable);
                      }}
                    />
                  ) : (
                    <span style={spanStyles}>{input.readonlyValue}</span>
                  )}
                </div>
              ))}
            {onShowMissingnessChange && (
              <div className={classes.showMissingness}>
                <Switch
                  label={`Include ${
                    outputEntity
                      ? makeEntityDisplayName(outputEntity, true)
                      : 'points'
                  } with no data for selected stratification variable(s)`}
                  state={showMissingness}
                  onStateChange={onShowMissingnessChange}
                  disabled={!enableShowMissingnessToggle}
                  labelPosition="after"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
