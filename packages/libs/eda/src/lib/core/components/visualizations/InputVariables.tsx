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
      marginBottom: '0.5em',
    },
    input: {
      display: 'flex',
      alignItems: 'center',
      '&:not(:last-of-type)': {
        marginRight: '2em',
      },
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
    primary: {},
    stratification: {
      border: '1px solid pink',
    },
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
  const disabledVariablesByInputIndex = useMemo(
    () =>
      inputs.map((input) => {
        const disabledVariables = excludedVariables(
          entities[0],
          flattenedConstraints && flattenedConstraints[input.name]
        );
        if (dataElementDependencyOrder == null) return disabledVariables;

        const index = dataElementDependencyOrder.indexOf(input.name);
        // no change if dependencyOrder is not declared
        if (index === -1) return disabledVariables;

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
        if (nextValue == null || nextValue.entityId === entities[0].id)
          return disabledVariables;
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
        return disabledVariables;
      }),
    [dataElementDependencyOrder, entities, flattenedConstraints, inputs, values]
  );

  const stratificationIsActive: boolean = useMemo(() => {
    // are any of the stratification inputs currently set to a variable?
    // e.g. values['overlayVariable'] is truthy
    return (
      inputs.filter(
        (input) => input.role === 'stratification' && values[input.name]
      ).length > 0
    );
  }, [inputs, values]);

  return (
    <div>
      <div className={classes.inputs}>
        {inputs.map((input, index) => (
          <div
            key={input.name}
            className={[classes.input, classes[input.role ?? 'primary']].join(
              ' '
            )}
          >
            <div className={classes.label}>{input.label}</div>
            <VariableTreeDropdown
              rootEntity={entities[0]}
              disabledVariables={disabledVariablesByInputIndex[index]}
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
        {onShowMissingnessChange &&
          inputs.filter((input) => input.role === 'stratification').length && (
            <div className={[classes.input, classes.stratification].join(' ')}>
              <Switch
                label={`Include ${
                  outputEntity
                    ? makeEntityDisplayName(outputEntity, true)
                    : 'points'
                } with no data for selected stratification variable(s)`}
                state={showMissingness}
                onStateChange={onShowMissingnessChange}
                disabled={!stratificationIsActive}
              />
            </div>
          )}
      </div>
      {/* <div className={`${classes.label} ${classes.dataLabel}`}>Data inputs</div> */}
    </div>
  );
}
