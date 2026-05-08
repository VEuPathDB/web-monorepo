import { ReactElement, ReactNode } from 'react';
import {
  Consumer,
  JsonPathBuilder,
  replaceElement,
  textChange,
} from '../../../../Utils';
import { AddRowButton } from './AddRowButton';
import { FieldHelpText } from './FieldHelpText';

export interface GrowableStringListProps {
  readonly labelPlural: string;
  readonly labelSingular: string;

  readonly values: string[] | undefined;
  readonly setValues: Consumer<string[]>;

  readonly jsonPath: JsonPathBuilder;

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
  const safeValues = Array.isArray(values) && values.length > 0 ? values : [''];

  const addValue = disabled ? () => {} : () => setValues([...safeValues, '']);

  const helpText = props.helpText ? (
    <FieldHelpText>{props.helpText}</FieldHelpText>
  ) : undefined;

  return (
    <>
      <label>{props.labelPlural}</label>
      <ol className="multi-input">
        {createListInputs(safeValues, setValues, jsonPath, disabled ?? false)}
      </ol>
      {helpText}
      <AddRowButton className="column-2" onClick={addValue} disabled={disabled}>
        + Additional {props.labelSingular}
      </AddRowButton>
    </>
  );
}

function createListInputs(
  values: string[],
  setValues: Consumer<string[]>,
  jsonPath: JsonPathBuilder,
  disabled: boolean
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
