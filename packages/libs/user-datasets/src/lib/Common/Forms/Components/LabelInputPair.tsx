import * as util from '../../../Utils';
import React, {
  ChangeEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  RefAttributes,
  RefObject,
  useMemo,
} from 'react';
import { FieldHelpText } from './FieldHelpText';
import { newUploadContent, UploadContent } from '../../../Service/Model';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface BaseInputProps<
  V,
  K extends HTMLInputTypeAttribute,
  E extends InputElement,
  T extends object = object
> {
  readonly type: K;
  readonly label: ReactNode;

  readonly onChange: util.Consumer<V>;

  readonly fieldName: (keyof T & string) | string;
  readonly nameOverride?: string;
  readonly idOverride?: string;

  readonly className?: string;
  readonly inputClass?: string;
  readonly labelClass?: string;

  readonly helpText?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly inputRef?: RefObject<E>;

  /**
   * Whether the label should appear to the right of the input instead of the
   * left.
   */
  readonly flipped?: boolean;

  readonly validator?: (props: BaseInputProps<V, K, E, T>) => boolean;
}

export interface TextInputProps<T extends object = object>
  extends BaseInputProps<
    string,
    'text' | 'email' | 'url',
    HTMLInputElement,
    T
  > {
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly validator?: (props: TextInputProps<T>) => boolean;
}

export interface TextAreaProps<T extends object = object>
  extends BaseInputProps<string, 'textarea', HTMLTextAreaElement, T> {
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly validator?: (props: TextAreaProps<T>) => boolean;
}

interface CheckboxProps<T extends object = object>
  extends BaseInputProps<boolean, 'checkbox', HTMLInputElement, T> {
  readonly checked?: boolean;
  readonly validator?: (props: CheckboxProps<T>) => boolean;
}

interface RadioProps<T extends object = object>
  extends Omit<
    BaseInputProps<ChangeEvent<HTMLInputElement>, 'radio', HTMLInputElement, T>,
    'validator'
  > {
  readonly value?: string;
  readonly checked?: boolean;
}

interface NumberProps<T extends object = object>
  extends BaseInputProps<number, 'number', HTMLInputElement, T> {
  readonly value?: number;
  readonly showControls?: boolean;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly validator?: (props: NumberProps<T>) => boolean;
}

export interface FileInputProps<T extends object = object>
  extends BaseInputProps<
    ReadonlyArray<UploadContent>,
    'file',
    HTMLInputElement,
    T
  > {
  readonly value?: ReadonlyArray<UploadContent>;
  readonly buttonText?: string;
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly validator?: (props: FileInputProps<T>) => boolean;
}

export type InputPairProps<T extends object = object> =
  | TextInputProps<T>
  | TextAreaProps<T>
  | FileInputProps<T>
  | CheckboxProps<T>
  | NumberProps<T>
  | RadioProps<T>;

type InputType<E> = E extends BaseInputProps<any, infer T, any> ? T : never;

enum ClassJoinType {
  Input,
  Label,
}

/**
 * Input with label and optional help text returned as individual elements with
 * no wrapping HTML element.
 */
export function LabelInputPair<T extends object>(
  props: InputPairProps<T>
): React.ReactElement {
  const helpText = props.helpText ? (
    <FieldHelpText className={props.className}>{props.helpText}</FieldHelpText>
  ) : undefined;

  let input: React.ReactElement;

  const fallbackRef = React.useRef<InputType<typeof props>>(null);

  const newProps = {
    ...props,
    inputRef: props.inputRef ?? fallbackRef,
  } as InputPairProps<T>;

  const isValid = useCustomValidator(newProps);
  const classNames = joinClasses(newProps, ClassJoinType.Input, isValid);

  switch (newProps.type) {
    case 'checkbox':
      input = <Checkbox<T> {...newProps} className={classNames} />;
      break;
    case 'number':
      input = <NumberInput<T> {...newProps} className={classNames} />;
      break;
    case 'radio':
      input = <RadioInput<T> {...newProps} className={classNames} />;
      break;
    case 'textarea':
      input = <TextAreaInput<T> {...newProps} className={classNames} />;
      break;
    case 'file':
      input = <FileInput<T> {...newProps} className={classNames} />;
      break;
    default:
      input = <TextInput<T> {...newProps} className={classNames} />;
      break;
  }

  return (
    <>
      {props.flipped && input}
      <label
        htmlFor={props.idOverride ?? props.fieldName}
        className={joinClasses(newProps, ClassJoinType.Label, isValid)}
      >
        {props.label}
      </label>
      {!props.flipped && input}
      {helpText}
    </>
  );
}

function useCustomValidator(props: InputPairProps<any>): boolean {
  return useMemo(() => {
    if (props.type === 'radio' || !props.validator) return true;

    switch (props.type) {
      case 'number':
        return props.validator(props);
      case 'checkbox':
        return props.validator(props);
      case 'file':
        return props.validator(props);
      case 'textarea':
        return props.validator(props);
      default:
        return props.validator(props);
    }
  }, [props]);
}

function Checkbox<T extends object>(props: CheckboxProps<T>): ReactElement {
  const checked = props.disabled ? false : (props.checked ?? false);
  return (
    <span className={props.className}>
      <input
        {...baseInputProps(props)}
        type="checkbox"
        className={props.className}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        checked={checked}
      />
    </span>
  );
}

function FileInput<T extends object>(
  props: FileInputProps<T>
): React.ReactElement {
  const fileName = props.value?.map((it) => it.name)?.join(', ');

  return (
    <div className="file-input-button">
      <input
        ref={props.inputRef}
        type="file"
        accept={props.accept}
        id={props.fieldName}
        name={props.fieldName}
        required={props.required}
        disabled={props.disabled}
        multiple={props.multiple}
        onChange={() => {
          props.onChange(
            Array.from(props.inputRef!.current?.files ?? []).map((it) =>
              newUploadContent(it)
            )
          );
        }}
      />
      <button
        type="button"
        onClick={() => props.inputRef!.current?.click()}
        disabled={props.disabled}
        style={{
          padding: '8px',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.85 : 1,
        }}
      >
        {props.buttonText}
      </button>
      {!props.disabled && fileName && <span>{fileName}</span>}
    </div>
  );
}

function NumberInput<T extends object>(props: NumberProps<T>): ReactElement {
  const value = props.disabled ? '' : (props.value ?? '');
  return (
    <input
      {...baseInputProps(props)}
      type="number"
      min={props.minimum}
      max={props.maximum}
      className={props.className}
      onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      value={value}
    />
  );
}

function RadioInput<T extends object>(props: RadioProps<T>): ReactElement {
  const checked = props.disabled ? false : (props.checked ?? false);
  return (
    <span className={props.className}>
      <input
        {...baseInputProps(props)}
        type="radio"
        value={props.value}
        className={props.className}
        onChange={props.onChange}
        checked={checked}
      />
    </span>
  );
}

function TextAreaInput<T extends object>(
  props: TextAreaProps<T>
): ReactElement {
  const value = props.disabled ? '' : (props.value ?? '');
  return (
    <textarea
      {...baseInputProps(props)}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      minLength={props.minLength}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
      rows={props.rows}
      value={value}
    />
  );
}

function TextInput<T extends object>(props: TextInputProps<T>): ReactElement {
  const value = props.disabled ? '' : (props.value ?? '');
  return (
    <input
      {...baseInputProps(props)}
      type={props.type ?? 'text'}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      value={value}
      minLength={props.minLength}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
    />
  );
}

function baseInputProps<T extends object, E extends InputElement>(
  props: BaseInputProps<any, any, E, T>
): InputHTMLAttributes<E> & RefAttributes<E> {
  return {
    ref: props.inputRef,
    id: props.idOverride ?? props.fieldName,
    name: props.nameOverride ?? props.fieldName,
    disabled: props.disabled,
    required: props.required,
  };
}

function joinClasses(
  props: InputPairProps<any>,
  type: ClassJoinType,
  isValid: boolean
): string {
  const out = props.className?.split(/\s+/) ?? [];

  switch (type) {
    case ClassJoinType.Input:
      if (props.inputClass) {
        out.push(props.inputClass);
      }
      break;
    case ClassJoinType.Label:
      if (props.labelClass) {
        out.push(props.labelClass);
      }

      if (props.required) {
        out.push('required');
      }
      break;
  }

  if (!isValid) out.push('invalid');

  return out.join(' ');
}
