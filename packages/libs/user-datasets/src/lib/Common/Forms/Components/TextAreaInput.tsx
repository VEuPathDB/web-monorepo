import { Consumer } from '../../../Utils';
import React, {
  ReactElement,
  ReactNode,
  RefObject,
  TextareaHTMLAttributes,
} from 'react';
import { FieldHelpText } from './FieldHelpText';

interface TextAreaInputProps<T extends object = object> {
  readonly label: string;

  readonly fieldName: keyof T & string;
  readonly nameOverride?: string;
  readonly idOverride?: string;

  readonly className?: string;
  readonly inputClass?: string;
  readonly labelClass?: string;

  readonly helpText?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly textAreaRef?: RefObject<HTMLTextAreaElement>;

  readonly onChange: Consumer<string>;
  readonly value?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly cols?: number;
}

export function TextAreaInput<T extends object = object>(
  props: TextAreaInputProps<T>
): ReactElement {
  const helpText = props.helpText ? (
    <FieldHelpText className={props.className}>{props.helpText}</FieldHelpText>
  ) : undefined;

  const inputClassName = [props.className, props.inputClass]
    .filter(Boolean)
    .join(' ');

  const labelClassName = [
    props.className,
    props.labelClass,
    props.required ? 'required' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <style>{`
        textarea::placeholder {
          color: #666;
          opacity: 1;
        }
      `}</style>
      <label
        htmlFor={props.idOverride ?? props.fieldName}
        className={labelClassName}
      >
        {props.label}
      </label>
      <textarea
        ref={props.textAreaRef}
        id={props.idOverride ?? props.fieldName}
        name={props.nameOverride ?? props.fieldName}
        disabled={props.disabled}
        required={props.required}
        className={inputClassName}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        value={props.value ?? ''}
        minLength={props.minLength}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        rows={props.rows ?? 10}
        cols={props.cols}
        style={{ width: '100%' }}
      />
      {helpText}
    </>
  );
}
