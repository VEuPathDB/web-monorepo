import { Consumer } from '../../../Utils';
import React, { ChangeEvent, InputHTMLAttributes, ReactElement, ReactNode, RefAttributes, RefObject } from 'react';
import { FieldHelpText } from './FieldHelpText';

interface BaseInputProps<T extends object = object> {
  readonly label: string;

  readonly fieldName: keyof T & string;
  readonly nameOverride?: string;
  readonly idOverride?: string;

  readonly className?:  string;
  readonly inputClass?: string;
  readonly labelClass?: string;

  readonly helpText?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly inputRef?: RefObject<HTMLInputElement>;

  /**
   * Whether the label should appear to the right of the input instead of the
   * left.
   */
  readonly flipped?: boolean;
}

interface TextProps<T extends object = object> extends BaseInputProps<T> {
  readonly type?: 'text' | 'email' | 'url';
  readonly onChange: Consumer<string>;
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
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

enum ClassJoinType { Input, Label }

export function InputPair<T extends object = object>(
  props: InputPairProps<T>
): ReactElement {
  const helpText = props.helpText ? (
    <FieldHelpText className={props.className}>{props.helpText}</FieldHelpText>
  ) : undefined;

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
      input = <TextInput<T> {...props} />;
      break;
  }

  return (
    <>
      {props.flipped && input}
      <label
        htmlFor={props.idOverride ?? props.fieldName}
        className={joinClasses(props, ClassJoinType.Label)}>
        {props.label}
      </label>
      {!props.flipped && input}
      {helpText}
    </>
  );
}

function Checkbox<T extends object>(props: CheckboxProps<T>): ReactElement {
  const className = joinClasses(props, ClassJoinType.Input);

  return (
    <span className={className}>
      <input
        {...baseInputProps(props)}
        type="checkbox"
        className={className}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        checked={props.checked ?? false}
      />
    </span>
  );
}

function NumberInput<T extends object>(props: NumberProps<T>): ReactElement {
  return (
    <input
      {...baseInputProps(props)}
      type="number"
      min={props.minimum}
      max={props.maximum}
      className={joinClasses(props, ClassJoinType.Input)}
      onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      value={props.value ?? ''}
    />
  );
}

function RadioInput<T extends object>(props: RadioProps<T>): ReactElement {
  const className = joinClasses(props, ClassJoinType.Input);

  return (
    <span className={className}>
      <input
        {...baseInputProps(props)}
        type="radio"
        value={props.value}
        className={className}
        onChange={props.onChange}
        checked={props.checked ?? false}
      />
    </span>
  );
}

function TextInput<T extends object>(props: TextProps<T>): ReactElement {
  return (
    <input
      {...baseInputProps(props)}
      type={props.type ?? 'text'}
      className={joinClasses(props, ClassJoinType.Input)}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      value={props.value ?? ''}
      minLength={props.minLength}
      maxLength={props.maxLength}
    />
  );
}

function baseInputProps(props: InputPairProps<any>): InputHTMLAttributes<any> & RefAttributes<HTMLInputElement> {
  return {
    ref:      props.inputRef,
    id:       props.idOverride ?? props.fieldName,
    name:     props.nameOverride ?? props.fieldName,
    disabled: props.disabled,
    required: props.required,
  };
}

function joinClasses(props: InputPairProps<any>, type: ClassJoinType): string {
  let className = "";

  if (props.className)
    className += props.className;

  switch (type) {
    case ClassJoinType.Input:
      if (props.inputClass)
        className += " " + props.inputClass;
      break;
    case ClassJoinType.Label:
      if (props.labelClass)
        className += " " + props.labelClass;
      if (props.required)
        className += " required";
      break;
  }

  return className;
}
