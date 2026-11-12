import React from 'react';
import * as util from '../../../Utils';
import { FieldHelpText } from './FieldHelpText';
import { LabelInputPair } from './LabelInputPair';
import { ActionKind, DatasetFormButton } from './DatasetFormButton';

export interface YesNoToggleProps {
  readonly value: util.Optional<boolean>;
  readonly setValue: util.Consumer<util.Optional<boolean>>;
  readonly fieldName: string;
  readonly helpText?: React.ReactNode;
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

export function YesNoToggle(props: YesNoToggleProps): React.ReactElement {
  const yesId = props.fieldName + '-yes';
  const noId = props.fieldName + '-no';

  const helpText = props.helpText
    ? <FieldHelpText>{props.helpText}</FieldHelpText>
    : undefined;

  const className = 'section-toggle'
    + (props.className ? ' ' + props.className : '');

  const labelClass = props.required && props.disableRequiredStyling
    ? 'hide-required'
    : undefined;

  return (
    <>
      <p className={className}>
        <LabelInputPair
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
        <LabelInputPair
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
        <ResetButton onClick={() => props.setValue(null)} show={props.value != null} />
      </p>
      {helpText}
    </>
  );
}

interface ResetButtonProps {
  readonly onClick: util.Runnable;
  readonly show: boolean;
}

const resetStyle: React.CSSProperties = {
  marginLeft: '1ch',
  padding: '0.35em 1.5ch',
  boxShadow: '2px 3px var(--coreui-gray-200)',
  visibility: 'hidden',
  animation: 'ease'
};

function ResetButton({ onClick, show }: ResetButtonProps): React.ReactElement {
  const style = show
    ? { ...resetStyle, visibility: undefined }
    : resetStyle;

  return (
    <DatasetFormButton onClick={onClick} kind={ActionKind.Tertiary} style={style}>
      Reset
    </DatasetFormButton>
  );
}