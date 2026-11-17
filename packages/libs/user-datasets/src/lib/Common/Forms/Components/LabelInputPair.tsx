import * as util from '../../../Utils';
import React from 'react';
import { FieldHelpText } from './FieldHelpText';
import { newUploadContent, UploadContent } from '../../../Service/Model';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface BaseInputProps<
  V,
  K extends React.HTMLInputTypeAttribute,
  E extends InputElement,
> {
  readonly type: K;
  readonly label: React.ReactNode;

  readonly onChange: util.Consumer<V>;

  readonly fieldName: string;
  readonly nameOverride?: string;
  readonly idOverride?: string;

  readonly className?: string;
  readonly inputClass?: string;
  readonly labelClass?: string;

  readonly helpText?: React.ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly inputRef?: React.RefObject<E>;

  /**
   * Whether the label should appear to the right of the input instead of the
   * left.
   */
  readonly flipped?: boolean;

  readonly validator?: (props: BaseInputProps<V, K, E>) => boolean;
}

export interface TextInputProps
  extends BaseInputProps<
    string,
    'text' | 'email' | 'url',
    HTMLInputElement
  > {
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly validator?: (props: TextInputProps) => boolean;
}

export interface TextAreaProps
  extends BaseInputProps<string, 'textarea', HTMLTextAreaElement> {
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly validator?: (props: TextAreaProps) => boolean;
}

interface CheckboxProps
  extends BaseInputProps<boolean, 'checkbox', HTMLInputElement> {
  readonly checked?: boolean;
  readonly validator?: (props: CheckboxProps) => boolean;
}

interface RadioProps
  extends Omit<
    BaseInputProps<React.ChangeEvent<HTMLInputElement>, 'radio', HTMLInputElement>,
    'validator'
  > {
  readonly value?: string;
  readonly checked?: boolean;
}

interface NumberProps
  extends BaseInputProps<number, 'number', HTMLInputElement> {
  readonly value?: number;
  readonly showControls?: boolean;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly validator?: (props: NumberProps) => boolean;
}

export interface FileInputProps
  extends BaseInputProps<
    ReadonlyArray<UploadContent>,
    'file',
    HTMLInputElement
  > {
  readonly value?: ReadonlyArray<UploadContent>;
  readonly buttonText?: string;
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly validator?: (props: FileInputProps) => boolean;
}

export type InputPairProps =
  | TextInputProps
  | TextAreaProps
  | FileInputProps
  | CheckboxProps
  | NumberProps
  | RadioProps;

type InputType<E> = E extends BaseInputProps<any, infer T, any> ? T : never;

enum ClassJoinType {
  Input,
  Label,
}

/**
 * Input with label and optional help text returned as individual elements with
 * no wrapping HTML element.
 */
export function LabelInputPair(props: InputPairProps): React.ReactElement {
  const helpText = props.helpText ? (
    <FieldHelpText className={props.className}>{props.helpText}</FieldHelpText>
  ) : undefined;

  let input: React.ReactElement;

  const fallbackRef = React.useRef<InputType<typeof props>>(null);

  const newProps = {
    ...props,
    inputRef: props.inputRef ?? fallbackRef,
  } as InputPairProps;

  const isValid = useCustomValidator(newProps);
  const classNames = joinClasses(newProps, ClassJoinType.Input, isValid);

  switch (newProps.type) {
    case 'checkbox':
      input = <Checkbox {...newProps} className={classNames} />;
      break;
    case 'number':
      input = <NumberInput {...newProps} className={classNames} />;
      break;
    case 'radio':
      input = <RadioInput {...newProps} className={classNames} />;
      break;
    case 'textarea':
      input = <TextAreaInput {...newProps} className={classNames} />;
      break;
    case 'file':
      input = <FileInput {...newProps} className={classNames} />;
      break;
    default:
      input = <TextInput {...newProps} className={classNames} />;
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

function useCustomValidator(props: InputPairProps): boolean {
  return React.useMemo(() => {
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

function Checkbox(props: CheckboxProps): React.ReactElement {
  return (
    <span className={props.className}>
      <input
        {...baseInputProps(props)}
        type="checkbox"
        className={props.className}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        checked={props.checked ?? false}
      />
    </span>
  );
}

function FileInput(
  props: FileInputProps
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
      {fileName && <span>{fileName}</span>}
    </div>
  );
}

function NumberInput(props: NumberProps): React.ReactElement {
  return (
    <input
      {...baseInputProps(props)}
      type="number"
      min={props.minimum}
      max={props.maximum}
      className={props.className}
      onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      value={props.value ?? ''}
    />
  );
}

function RadioInput(props: RadioProps): React.ReactElement {
  return (
    <span className={props.className}>
      <input
        {...baseInputProps(props)}
        type="radio"
        value={props.value}
        className={props.className}
        onChange={props.onChange}
        checked={props.checked ?? false}
      />
    </span>
  );
}

function TextAreaInput(
  props: TextAreaProps
): React.ReactElement {
  return (
    <textarea
      {...baseInputProps(props)}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      minLength={props.minLength}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
      rows={props.rows}
      value={props.value ?? ''}
    />
  );
}

function TextInput(props: TextInputProps): React.ReactElement {
  return (
    <input
      {...baseInputProps(props)}
      type={props.type ?? 'text'}
      className={props.className}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      value={props.value ?? ''}
      minLength={props.minLength}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
    />
  );
}

function baseInputProps<E extends InputElement>(
  props: BaseInputProps<any, any, E>
): React.InputHTMLAttributes<E> & React.RefAttributes<E> {
  return {
    ref: props.inputRef,
    id: props.idOverride ?? props.fieldName,
    name: props.nameOverride ?? props.fieldName,
    disabled: props.disabled,
    required: props.required,
  };
}

function joinClasses(
  props: InputPairProps,
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
