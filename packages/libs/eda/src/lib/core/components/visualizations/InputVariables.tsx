import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import {
  DataElementConstraintRecord,
  excludedVariables,
  flattenConstraints,
  ValueByInputName,
} from '../../utils/data-element-constraints';
import { VariableTreeDropdown } from '../VariableTree';
import {
  mapStructure,
  preorder,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import { makeEntityDisplayName } from '../../utils/study-metadata';

interface InputSpec {
  name: string;
  label: string;
  role: 'primary' | 'stratification';
}

export interface Props {
  /**
   * This defines the order the variables appear, and the names associated with
   * their values. If the name properties exist in `constraints`, the
   * associated constraint will be applied.
   */
  inputs: InputSpec[];
  /**
   * Study entities used to look up entity and variable details.
   */
  entities: StudyEntity[];
  /**
   * Current set of values for `inputs`.
   * In other words, the currently selected variables.
   */
  values: ValueByInputName;
  /**
   * Change handler that is called when any input value is changed.
   */
  onChange: (values: ValueByInputName) => void;
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
   * An array of variable IDs for the user's "My Variables"
   */
  starredVariables: string[];
  /**
   * A callback for toggling the starred state of a variable with a given ID
   */
  toggleStarredVariable: (targetVariableId: string) => void;
  /** When false, disable (gray out) the showMissingness toggle */
  enableShowMissingnessToggle?: boolean;
  /** controlled state of stratification variables' showMissingness toggle switch (optional) */
  showMissingness?: boolean;
  /** handler for showMissingness state change */
  onShowMissingnessChange?: (newState: boolean) => void;
  /** output entity, required for toggle switch label */
  outputEntity?: StudyEntity;
}

const useStyles = makeStyles(
  {
    inputs: {
      display: 'flex',
      flexWrap: 'nowrap', // if it didn't wrap so aggressively, it would be good to allow wrapping
      // perhaps after the Material UI capitalization is removed.
      marginLeft: '0.5em', // this indent is only needed because the wdk-SaveableTextEditor above it is indented
      alignItems: 'flex-start',
    },
    inputGroup: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    input: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5em', // in case they end up stacked vertically on a narrow screen
      marginRight: '2em',
    },
    label: {
      marginRight: '1ex',
      fontWeight: 500,
    },
    dataLabel: {
      textAlign: 'right',
      marginTop: '2em',
      fontSize: '1.35em',
      fontWeight: 500,
    },
    fullRow: {
      flexBasis: '100%',
    },
    primary: {},
    stratification: {},
    showMissingness: {},
  },
  {
    name: 'InputVariables',
  }
);

export function InputVariables(props: Props) {
  const {
    inputs,
    entities,
    values,
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
  const classes = useStyles();
  const handleChange = (inputName: string, value?: VariableDescriptor) => {
    onChange({ ...values, [inputName]: value });
  };
  const flattenedConstraints =
    constraints && flattenConstraints(values, entities, constraints);

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

        const prevValue = dataElementDependencyOrder
          .slice(0, index)
          .map((n) => values[n])
          .reverse()
          .find((v) => v != null);
        const nextValue = dataElementDependencyOrder
          .slice(index + 1)
          .map((n) => values[n])
          .find((v) => v != null);

        // Remove descendants of next input's entity
        if (prevValue) {
          const entity = entities.find(
            (entity) => entity.id === prevValue.entityId
          );
          if (entity == null) throw new Error('Unknown entity used.');
          const childVariables = Array.from(
            preorder(entity, (e) => e.children ?? [])
          )
            .slice(1)
            .flatMap((e) =>
              e.variables.map(
                (variable): VariableDescriptor => ({
                  variableId: variable.id,
                  entityId: e.id,
                })
              )
            );
          disabledVariables.push(...childVariables);
        }

        // remove ancestors of previous input's entity
        if (nextValue == null || nextValue.entityId === entities[0].id) {
          map[input.name] = disabledVariables;
          return map;
        }
        const ancestorTree = mapStructure<StudyEntity, StudyEntity>(
          (entity, children) => ({
            ...entity,
            children: children.filter((e) => e.id !== nextValue.entityId),
          }),
          (entity) => entity.children ?? [],
          entities[0]
        );
        const ancestorVariables = Array.from(
          preorder(ancestorTree, (e) => e.children ?? [])
        ).flatMap((e) =>
          e.variables.map((variable) => ({
            variableId: variable.id,
            entityId: e.id,
          }))
        );
        disabledVariables.push(...ancestorVariables);
        map[input.name] = disabledVariables;
        return map;
      }, {} as Record<string, VariableDescriptor[]>),
    [dataElementDependencyOrder, entities, flattenedConstraints, inputs, values]
  );

  return (
    <div>
      <div className={classes.inputs}>
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
                <div className={classes.label}>{input.label}</div>
                <VariableTreeDropdown
                  rootEntity={entities[0]}
                  disabledVariables={disabledVariablesByInputName[input.name]}
                  starredVariables={starredVariables}
                  toggleStarredVariable={toggleStarredVariable}
                  entityId={values[input.name]?.entityId}
                  variableId={values[input.name]?.variableId}
                  onChange={(variable) => {
                    handleChange(input.name, variable);
                  }}
                />
              </div>
            ))}
        </div>
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
                  <div className={classes.label}>{input.label}</div>
                  <VariableTreeDropdown
                    rootEntity={entities[0]}
                    disabledVariables={disabledVariablesByInputName[input.name]}
                    starredVariables={starredVariables}
                    toggleStarredVariable={toggleStarredVariable}
                    entityId={values[input.name]?.entityId}
                    variableId={values[input.name]?.variableId}
                    onChange={(variable) => {
                      handleChange(input.name, variable);
                    }}
                  />
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
