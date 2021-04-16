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
   * TODO Describe what the order means.
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
  console.log({ flattenedConstraints });
  return (
    <div className={classes.root}>
      <div className={classes.inputs}>
        {inputs.map((input) => (
          <div key={input.name} className={classes.input}>
            <div className={classes.label}>{input.label}</div>
            <VariableTreeDropdown
              entities={filterVariablesByConstraint(
                entities,
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
