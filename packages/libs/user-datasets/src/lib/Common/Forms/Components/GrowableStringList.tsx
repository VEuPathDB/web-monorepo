import React, { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Consumer,
  JsonPathBuilder,
  replaceElement,
  textChange,
} from '../../../Utils';
import { AddRowButton } from './AddRowButton';
import { FieldHelpText } from './FieldHelpText';

export interface GrowableStringListProps {
  readonly labelPlural: string;
  readonly labelSingular: string;

  readonly values: string[] | undefined;
  readonly setValues: Consumer<string[]>;

  readonly jsonPath: JsonPathBuilder;

  readonly required: boolean;

  readonly disabled?: boolean;
  readonly helpText?: ReactNode;
}

export function GrowableStringList({
  values,
  setValues,
  jsonPath,
  disabled,
  ...props
}: GrowableStringListProps): ReactElement {
  const safeValues = useMemo(
    () => (Array.isArray(values) && values.length > 0 ? values : ['']),
    [values]
  );

  const [addedValue, setAddedValue] = useState(false);

  const addValue = disabled
    ? () => {}
    : () => {
        setValues([...safeValues, '']);
        setAddedValue(true);
      };

  useEffect(() => {
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
      <label>{props.labelPlural}</label>
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
  readonly values:    string[];
  readonly setValues: Consumer<string[]>;
  readonly jsonPath:  JsonPathBuilder;
  readonly disabled:  boolean;
  readonly required:  boolean;
}

function InputList(props: InputListProps): ReactElement {
  return <>
    {props.values.map((value, index) => {
      const fieldName = props.jsonPath.appendToString(index);

      return (
        <li key={fieldName}>
          <input
            type="text"
            name={fieldName}
            id={fieldName}
            onChange={textChange((v) => {
              if (!props.disabled)
                props.setValues(replaceElement(props.values, index, v ?? ''));
            })}
            value={value}
            disabled={props.disabled}
            required={props.required && index === 0}
          />
        </li>
      );
    })}
  </>;
}

function createListInputs(
  values: string[],
  setValues: Consumer<string[]>,
  jsonPath: JsonPathBuilder,
  disabled: boolean,
  required: boolean,
): ReactElement[] {
  return values.map((value, index) => {
    const fieldName = jsonPath.appendToString(index);

    return (
      <li key={fieldName}>
        <input
          type="text"
          name={fieldName}
          id={fieldName}
          onChange={textChange((v) => {
            if (!disabled) setValues(replaceElement(values, index, v ?? ''));
          })}
          value={value}
          disabled={disabled}
        />
      </li>
    );
  });
}
