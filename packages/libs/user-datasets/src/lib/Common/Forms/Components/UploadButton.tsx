import React, { ReactElement, ReactNode } from 'react';
import { isNonEmptyString } from '../../../Utils';

export enum SubmittableState {
  Invalid,
  InProgress,
  Submittable,
}

export interface UploadButtonProps {
  readonly buttonText?: string;
  readonly onClick: () => void;
  readonly className?: string;
  readonly submittable?: SubmittableState;
}

export function UploadButton(props: UploadButtonProps): ReactElement {
  let disabled = false;

  let className = 'upload-button';

  let invalidFormHelp: ReactNode;

  if (isNonEmptyString(props.className))
    className += ' ' + props.className;

  switch (props.submittable) {
    case SubmittableState.InProgress:
      disabled = true;
      break;

    case SubmittableState.Submittable:
      // change nothing! - no message to show, no button disabling
      break;

    case SubmittableState.Invalid:
    case undefined:
    case null:
    default:
      disabled = true;
      invalidFormHelp = (
        <p className="invalid-form-help">
          All required fields must be filled before upload.
        </p>
      );
  }

  if (disabled)
    className += ' disabled';

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={disabled ? undefined : props.onClick}
        disabled={disabled}
      >
        {props.buttonText ?? 'Upload Dataset'}
      </button>
      {invalidFormHelp}
    </>
  );
}
