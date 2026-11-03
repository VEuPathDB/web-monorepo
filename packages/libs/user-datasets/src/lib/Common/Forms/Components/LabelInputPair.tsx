import * as util from '../../../Utils';
import React, {
  ChangeEvent,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  RefAttributes,
  RefObject
} from 'react';
import { FieldHelpText } from './FieldHelpText';
import { newUploadContent, UploadContent } from '../../../Service/Model';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface BaseInputProps<V, E extends InputElement, T extends object = object> {
  readonly label: ReactNode;

  readonly onChange: util.Consumer<V>;

  readonly fieldName: keyof T & string;
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

  readonly validator?: util.Function<E, boolean>;
}

interface TextProps<T extends object = object> extends BaseInputProps<string, HTMLInputElement, T> {
  readonly type?: 'text' | 'email' | 'url';
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
}

interface TextAreaProps<T extends object = object> extends BaseInputProps<string, HTMLTextAreaElement, T> {
  readonly type: 'textarea';
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly rows?: number;
}

interface CheckboxProps<T extends object = object> extends BaseInputProps<boolean, HTMLInputElement, T> {
  readonly type: 'checkbox';
  readonly checked?: boolean;
}

interface RadioProps<T extends object = object> extends BaseInputProps<ChangeEvent<HTMLInputElement>, HTMLInputElement, T> {
  readonly type: 'radio';
  readonly value?: string;
  readonly checked?: boolean;
}

interface NumberProps<T extends object = object> extends BaseInputProps<number, HTMLInputElement, T> {
  readonly type: 'number';
  readonly value?: number;
  readonly showControls?: boolean;
  readonly minimum?: number;
  readonly maximum?: number;
}

interface FileProps<T extends object = object> extends BaseInputProps<ReadonlyArray<UploadContent>, HTMLInputElement, T> {
  readonly type: 'file';
  readonly value?: ReadonlyArray<UploadContent>,
  readonly buttonText?: string;
  readonly accept?: string;
  readonly multiple?: boolean;
}

export type InputPairProps<T extends object = object> =
  | TextProps<T>
  | TextAreaProps<T>
  | FileProps<T>
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
export function LabelInputPair<T extends object>(props: InputPairProps<T>): React.ReactElement {
  const helpText = props.helpText ? (
    <FieldHelpText className={props.className}>{props.helpText}</FieldHelpText>
  ) : undefined;

  let input: React.ReactElement;

  const fallbackRef = React.useRef<InputType<typeof props>>(null);

  const newProps = {
    ...props,
    inputRef: props.inputRef ?? fallbackRef,
  } as InputPairProps<T>;

  switch (newProps.type) {
    case 'checkbox':
      input = <Checkbox<T> {...newProps} />;
      break;
    case 'number':
      input = <NumberInput<T> {...newProps} />;
      break;
    case 'radio':
      input = <RadioInput<T> {...newProps} />;
      break;
    case 'textarea':
      input = <TextAreaInput<T> {...newProps} />;
      break;
    case 'file':
      input = <FileInput<T> {...newProps} />;
      break;
    default:
      input = <TextInput<T> {...newProps} />;
      break;
  }

  return (
    <>
      {props.flipped && input}
      <label
        htmlFor={props.idOverride ?? props.fieldName}
        className={joinClasses(newProps, ClassJoinType.Label)}
      >
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

function FileInput<T extends object>(props: FileProps<T>): React.ReactElement {
  const fileName = props.value
    ?.map(it => it.name)
    ?.join(', ');

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
          props.onChange(Array.from(props.inputRef!.current?.files ?? [])
            .map(it => newUploadContent(it)));
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

function TextAreaInput<T extends object>(props: TextAreaProps<T>): ReactElement {
  return (
    <textarea
      {...baseInputProps(props)}
      className={joinClasses(props, ClassJoinType.Input)}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      minLength={props.minLength}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
      rows={props.rows}
      value={props.value ?? ''}
    />
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
      placeholder={props.placeholder}
    />
  );
}

function baseInputProps<V, E extends InputElement>(
  props: BaseInputProps<V, E, any>
): InputHTMLAttributes<E> & RefAttributes<E> {
  return {
    ref: props.inputRef,
    id: props.idOverride ?? props.fieldName,
    name: props.nameOverride ?? props.fieldName,
    disabled: props.disabled,
    required: props.required,
  };
}

function joinClasses(props: InputPairProps<any>, type: ClassJoinType): string {
  const out = props.className?.split(/\s+/) ?? [];

  if (props.inputRef?.current == null) {
    return out.join(' ');
  }

  if (props.validator != null && !(props.validator as util.Function<any, boolean>)(props.inputRef.current)) {
    out.push('invalid');
  } else if (!props.inputRef.current?.checkValidity()) {
    out.push('invalid')
  }

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

  return out.join(' ');
}
