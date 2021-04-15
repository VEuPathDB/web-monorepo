import { makeStyles } from '@material-ui/core';
import React from 'react';
import { StudyEntity } from '../../types/study';
import { DataElementConstraint } from '../../types/visualization';
import { VariableTreeDropdown } from '../VariableTree';

interface VariableDescriptor {
  variableId: string;
  entityId: string;
}

type ValueByInputName = Record<string, VariableDescriptor | undefined>;

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
  constraints?: Record<string, DataElementConstraint>[];
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
  const { inputs, entities, values, onChange } = props;
  const classes = useStyles();
  const handleChange = (inputName: string, value?: VariableDescriptor) => {
    onChange({ ...values, [inputName]: value });
  };
  return (
    <div className={classes.root}>
      <div className={classes.inputs}>
        {inputs.map((input, index) => (
          <div key={input.name} className={classes.input}>
            <div className={classes.label}>{input.label}</div>
            <VariableTreeDropdown
              entities={entities}
              entityId={values[input.name]?.entityId}
              variableId={values[input.name]?.variableId}
              onActiveFieldChange={(fieldId) => {
                if (fieldId == null) {
                  handleChange(input.name, undefined);
                  return;
                }
                const [entityId, variableId] = fieldId.split('/');
                handleChange(input.name, { entityId, variableId });
              }}
            />
          </div>
        ))}
      </div>
      <div className={`${classes.label} ${classes.dataLabel}`}>Data inputs</div>
    </div>
  );
}
