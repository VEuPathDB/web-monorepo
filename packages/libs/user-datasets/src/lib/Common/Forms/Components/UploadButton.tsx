import React from 'react';
import { isNonEmptyString } from '../../../Utils';
import { DatasetFormButton } from './DatasetFormButton';

export enum SubmittableState {
  Invalid,
  InProgress,
  Submittable,
  NothingToDo,
}

export interface UploadButtonProps {
  readonly buttonText?: string;
  readonly onClick: () => void;
  readonly className?: string;
  readonly submittable?: SubmittableState;
}

export function UploadButton(props: UploadButtonProps): React.ReactElement {
  let disabled = false;

  let className = 'upload-button';

  let invalidFormHelp: React.ReactNode;

  if (isNonEmptyString(props.className)) {
    className += ' ' + props.className;
  }

  switch (props.submittable) {
    case SubmittableState.InProgress:
    case SubmittableState.NothingToDo:
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

  if (disabled) {
    className += ' disabled';
  }

  return (
    <>
      <DatasetFormButton
        className={className}
        onClick={props.onClick}
        disabled={disabled}
      >
        {props.buttonText ?? 'Upload Dataset'}
      </DatasetFormButton>
      {invalidFormHelp}
    </>
  );
}
