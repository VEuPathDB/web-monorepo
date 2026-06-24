import React, { ReactElement, ReactNode, useState } from 'react';
import { Consumer } from '../../../Utils';
import { FieldHelpText } from './FieldHelpText';
import { InputPair } from './InputPair';

export interface YesNoToggleProps {
  readonly value: boolean | undefined;
  readonly setValue: Consumer<boolean>;
  readonly fieldName: string;
  readonly helpText?: ReactNode;
  readonly className?: string;
  readonly required?: boolean;
}

export function YesNoToggle(props: YesNoToggleProps): ReactElement {
  const yesId = props.fieldName + '-yes';
  const noId = props.fieldName + '-no';

  const helpText = props.helpText ? (
    <FieldHelpText>{props.helpText}</FieldHelpText>
  ) : undefined;

  const className =
    'section-toggle' + (props.className ? ' ' + props.className : '');

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
          flipped={true}
          onChange={(e) => props.setValue(!e.currentTarget.checked)}
        />
      </p>
      {helpText}
    </>
  );
}
