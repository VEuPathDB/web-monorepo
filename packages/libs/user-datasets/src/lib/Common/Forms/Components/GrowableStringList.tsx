import React from 'react';
import * as util from '../../../Utils';

import { AddRowButton } from './AddRowButton';
import { FieldHelpText } from './FieldHelpText';

export interface GrowableStringListProps {
  readonly labelPlural: string;
  readonly labelSingular: string;

  readonly values: util.Possible<ReadonlyArray<string>>;
  readonly setValues: util.Consumer<ReadonlyArray<string>>;

  readonly jsonPath: util.JsonPathBuilder;

  readonly required: boolean;

  readonly disabled?: boolean;
  readonly helpText?: React.ReactNode;
}

export function GrowableStringList({
  values,
  setValues,
  jsonPath,
  disabled,
  ...props
}: GrowableStringListProps): React.ReactElement {
  const safeValues = React.useMemo(
    () => (Array.isArray(values) && values.length > 0 ? values : ['']),
    [values]
  );

  const [addedValue, setAddedValue] = React.useState(false);

  const addValue = disabled
    ? () => {}
    : () => {
        setValues([...safeValues, '']);
        setAddedValue(true);
      };

  React.useEffect(() => {
    if (addedValue) {
      document
        .getElementById(jsonPath.appendToString(safeValues.length - 1))
        ?.focus();
      setAddedValue(false);
    }
  }, [addedValue, safeValues, jsonPath]);

  const helpText = props.helpText ? (
    <FieldHelpText>{props.helpText}</FieldHelpText>
  ) : undefined;

  return (
    <>
      <label className={props.required ? 'required' : undefined}>
        {props.labelPlural}
      </label>
      <ol className="multi-input">
        <InputList
          values={safeValues}
          setValues={setValues}
          jsonPath={jsonPath}
          disabled={disabled ?? false}
          required={props.required}
        />
      </ol>
      {helpText}
      <AddRowButton className="column-2" onClick={addValue} disabled={disabled}>
        + Additional {props.labelSingular}
      </AddRowButton>
    </>
  );
}

interface InputListProps {
  readonly values: ReadonlyArray<string>;
  readonly setValues: util.Consumer<ReadonlyArray<string>>;
  readonly jsonPath: util.JsonPathBuilder;
  readonly disabled: boolean;
  readonly required: boolean;
}

function InputList(props: InputListProps): React.ReactElement {
  return (
    <>
      {props.values.map((value, index) => {
        const fieldName = props.jsonPath.appendToString(index);

        return (
          <li key={fieldName}>
            <input
              type="text"
              name={fieldName}
              id={fieldName}
              onChange={util.textChange((v) => {
                if (!props.disabled)
                  props.setValues(util.replaceElement(props.values, index, v ?? ''));
              })}
              value={value}
              disabled={props.disabled}
              required={props.required && index === 0}
            />
          </li>
        );
      })}
    </>
  );
}
