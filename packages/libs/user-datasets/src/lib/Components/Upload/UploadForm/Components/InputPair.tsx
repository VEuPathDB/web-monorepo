import { Consumer } from '../../../../Utils';
import { ChangeEvent, ReactElement, ReactNode } from 'react';
import { FieldHelpText } from './FieldHelpText';

interface BaseInputProps<T extends object = object> {
  readonly label: string;
  readonly fieldName: keyof T & string;
  readonly nameOverride?: string;
  readonly idOverride?: string;
  readonly labelClass?: string;
  readonly className?: string;
  readonly helpText?: ReactNode;
  readonly disabled?: boolean;
}

interface TextProps<T extends object = object> extends BaseInputProps<T> {
  readonly type?: 'text';
  readonly onChange: Consumer<string>;
  readonly value?: string;
}

interface CheckboxProps<T extends object = object> extends BaseInputProps<T> {
  readonly type: 'checkbox';
  readonly onChange: Consumer<boolean>;
  readonly checked?: boolean;
}

interface RadioProps<T extends object = object> extends BaseInputProps<T> {
  readonly type: 'radio';
  readonly value?: string;
  readonly checked?: boolean;
  readonly onChange: Consumer<ChangeEvent<HTMLInputElement>>;
}

interface NumberProps<T extends object = object> extends BaseInputProps<T> {
  readonly type: 'number';
  readonly onChange: Consumer<number>;
  readonly value?: number;
  readonly showControls?: boolean;
  readonly minimum?: number;
  readonly maximum?: number;
}

export type InputPairProps<T extends object = object> =
  | TextProps<T>
  | CheckboxProps<T>
  | NumberProps<T>
  | RadioProps<T>;

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

  let input: ReactElement;

  switch (props.type) {
    case 'checkbox':
      input = <Checkbox<T> {...props} />;
      break;
    case 'number':
      input = <NumberInput<T> {...props} />;
      break;
    case 'radio':
      input = <RadioInput<T> {...props} />;
      break;
    default:
      input = <DefaultInput<T> {...props} />;
      break;
  }

  return (
    <>
      <label htmlFor={props.fieldName} className={labelClass}>
        {props.label}
      </label>
      {input}
      {helpText}
    </>
  );
}

function Checkbox<T extends object>(props: CheckboxProps<T>): ReactElement {
  return (
    <span>
      <input
        type="checkbox"
        id={props.idOverride ?? props.fieldName}
        name={props.nameOverride ?? props.fieldName}
        className={props.className}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        checked={props.checked ?? false}
        disabled={props.disabled}
      />
    </span>
  );
}

function NumberInput<T extends object>(props: NumberProps<T>): ReactElement {
  return (
    <input
      type="number"
      min={props.minimum}
      max={props.maximum}
      id={props.idOverride ?? props.fieldName}
      name={props.nameOverride ?? props.fieldName}
      className={props.className}
      onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      value={props.value ?? ''}
      disabled={props.disabled}
    />
  );
}

function RadioInput<T extends object>(props: RadioProps<T>): ReactElement {
  return (
    <span>
      <input
        type="radio"
        id={props.idOverride ?? props.fieldName}
        name={props.nameOverride ?? props.fieldName}
        value={props.value}
        className={props.className}
        onChange={props.onChange}
        checked={props.checked ?? false}
        disabled={props.disabled}
      />
    </span>
  );
}

function DefaultInput<T extends object>(props: TextProps<T>): ReactElement {
  return (
    <input
      type="text"
      id={props.idOverride ?? props.fieldName}
      name={props.nameOverride ?? props.fieldName}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      value={props.value ?? ''}
      disabled={props.disabled}
    />
  );
}
