import React from 'react';
import { makeStyles } from '@material-ui/core';
import { StudyEntity } from '../../types/study';
import { Variable } from '../../types/variable';
import {
  DataElementConstraintRecord,
  filterVariablesByConstraint,
  flattenConstraints,
  ValueByInputName,
} from '../../utils/data-element-constraints';
import { VariableTreeDropdown } from '../VariableTree';
import { mapStructure } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

interface InputSpec {
  name: string;
  label: string;
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
}

const useStyles = makeStyles(
  {
    inputs: {
      display: 'flex',
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
  } = props;
  const classes = useStyles();
  const handleChange = (inputName: string, value?: Variable) => {
    onChange({ ...values, [inputName]: value });
  };
  const flattenedConstraints =
    constraints && flattenConstraints(values, entities, constraints);

  // Steps
  // 1. Get closest prev and next values
  // 2. If next defined, root is next's entity, otherwise default root entity
  // 3. If prev is defined, remove prev's entity's children
  // 4. Return tree.
  const rootEntities = inputs.map((input) => {
    if (dataElementDependencyOrder == null) return entities[0];

    // 1
    const index = dataElementDependencyOrder.indexOf(input.name);
    // return root entity if dependencyOrder is not declared
    if (index === -1) return entities[0];

    const prevValue = dataElementDependencyOrder
      .slice(0, index)
      .map((n) => values[n])
      .reverse()
      .find((v) => v != null);
    const nextValue = dataElementDependencyOrder
      .slice(index + 1)
      .map((n) => values[n])
      .find((v) => v != null);

    // 2
    const rootEntityId = nextValue?.entityId ?? entities[0].id;
    const rootEntity =
      entities.find((entity) => entity.id === rootEntityId) ?? entities[0];

    // 3
    return prevValue == null
      ? rootEntity
      : mapStructure(
          (entity) =>
            entity.id === prevValue.entityId
              ? { ...entity, children: [] }
              : entity,
          (entity) => entity.children ?? [],
          rootEntity
        );
  });

  return (
    <div>
      <div className={classes.inputs}>
        {inputs.map((input, index) => (
          <div key={input.name} className={classes.input}>
            <div className={classes.label}>{input.label}</div>
            <VariableTreeDropdown
              rootEntity={filterVariablesByConstraint(
                rootEntities[index],
                flattenedConstraints && flattenedConstraints[input.name]
              )}
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
      {/* <div className={`${classes.label} ${classes.dataLabel}`}>Data inputs</div> */}
    </div>
  );
}
