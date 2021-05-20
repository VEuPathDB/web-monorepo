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
}

const useStyles = makeStyles(
  {
    root: {
      border: '2px solid rgb(240, 240, 240)',
      padding: '1.5em',
      borderRadius: '10px',
      color: 'rgb(150, 150, 150)',
    },
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
      fontWeight: 'bold',
      textTransform: 'uppercase',
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
  const { inputs, entities, values, onChange, constraints } = props;
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
  const rootEntities = inputs.map((input, index) => {
    // 1
    const inputValues = inputs.map((input) => values[input.name]);
    const prevValue = inputValues
      .slice(0, index)
      .reverse()
      .find((v) => v != null);
    const nextValue = inputValues.slice(index + 1).find((v) => v != null);

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
    <div className={classes.root}>
      <div className={classes.inputs}>
        {inputs.map((input, index) => (
          <div key={input.name} className={classes.input}>
            <div className={classes.label}>{input.label}</div>
            <VariableTreeDropdown
              rootEntity={filterVariablesByConstraint(
                rootEntities[index],
                flattenedConstraints && flattenedConstraints[input.name]
              )}
              entityId={values[input.name]?.entityId}
              variableId={values[input.name]?.variableId}
              onChange={(variable) => {
                handleChange(input.name, variable);
              }}
            />
          </div>
        ))}
      </div>
      <div className={`${classes.label} ${classes.dataLabel}`}>Data inputs</div>
    </div>
  );
}
