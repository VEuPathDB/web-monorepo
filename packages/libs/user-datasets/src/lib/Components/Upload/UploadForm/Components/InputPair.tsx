import { Consumer } from '../../../../Utils';
import { HTMLInputTypeAttribute, ReactElement, ReactNode } from 'react';
import { FieldHelpText } from './FieldHelpText';

interface BaseInputProps<T extends object = object> {
  readonly label: string;
  readonly fieldName: keyof T & string;
  readonly labelClass?: string;
  readonly className?: string;
  readonly helpText?: ReactNode;
  readonly disabled?: boolean;
}

interface CheckboxProps<T extends object = object> extends BaseInputProps<T> {
  readonly type: 'checkbox';
  readonly onChange: Consumer<boolean>;
  readonly checked?: boolean;
}

interface TextProps<T extends object = object> extends BaseInputProps<T> {
  readonly type?: Exclude<HTMLInputTypeAttribute, 'checkbox' | (string & {})>;
  readonly onChange: Consumer<string>;
  readonly value?: string;
}

export type InputPairProps<T extends object = object> =
  | TextProps<T>
  | CheckboxProps<T>;

export function InputPair<T extends object = object>(
  props: InputPairProps<T>
): ReactElement {
  const helpText = props.helpText ? (
    <FieldHelpText className={props.className}>{props.helpText}</FieldHelpText>
  ) : undefined;

  const labelClass = props.className
    ? props.labelClass
      ? `${props.className} ${props.labelClass}`
      : props.className
    : props.labelClass;

  return (
    <>
      <label htmlFor={props.fieldName} className={labelClass}>
        {props.label}
      </label>
      {props.type === 'checkbox' ? Checkbox(props) : TextInput(props)}
      {helpText}
    </>
  );
}

function Checkbox<T extends object>(props: CheckboxProps<T>): ReactElement {
  return (
    <input
      type="checkbox"
      id={props.fieldName}
      name={props.fieldName}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.checked)}
      checked={props.checked ?? false}
    />
  );
}

function TextInput<T extends object>(props: TextProps<T>): ReactElement {
  return (
    <input
      type={props.type ?? 'text'}
      id={props.fieldName}
      name={props.fieldName}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      value={props.value ?? ''}
    />
  );
}
