import React, { ReactElement, ReactNode } from 'react';
import { Consumer } from '../../../Utils';
import { FieldHelpText } from './FieldHelpText';
import { InputPair } from './InputPair';

export interface YesNoToggleProps {
  readonly value: boolean | undefined;
  readonly setValue: Consumer<boolean>;
  readonly fieldName: string;
  readonly helpText?: ReactNode;
  readonly className?: string;

  /**
   * Whether the yes/no toggle elements should be marked as required.
   */
  readonly required?: boolean;

  /**
   * Whether the yes/no toggle labels should be styled as normal for required
   * inputs.
   */
  readonly disableRequiredStyling?: boolean;
}

export function YesNoToggle(props: YesNoToggleProps): ReactElement {
  const yesId = props.fieldName + '-yes';
  const noId = props.fieldName + '-no';

  const helpText = props.helpText ? (
    <FieldHelpText>{props.helpText}</FieldHelpText>
  ) : undefined;

  const className =
    'section-toggle' + (props.className ? ' ' + props.className : '');

  const labelClass =
    props.required && props.disableRequiredStyling
      ? 'hide-required'
      : undefined;

  return (
    <>
      <p className={className}>
        <InputPair
          label="Yes"
          type="radio"
          value="1"
          idOverride={yesId}
          fieldName={props.fieldName}
          checked={props.value === true}
          required={props.required}
          labelClass={labelClass}
          flipped={true}
          onChange={(e) => props.setValue(e.currentTarget.checked)}
        />
        <InputPair
          label="No"
          type="radio"
          value="0"
          idOverride={noId}
          fieldName={props.fieldName}
          checked={props.value === false}
          required={props.required}
          labelClass={labelClass}
          flipped={true}
          onChange={(e) => props.setValue(!e.currentTarget.checked)}
        />
      </p>
      {helpText}
    </>
  );
}
