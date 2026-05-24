import { ReactElement, ReactNode } from 'react';
import { isNonEmptyString } from '../../../../Utils';

export interface UploadButtonProps {
  readonly buttonText?: string;
  readonly onClick: () => void;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function UploadButton(props: UploadButtonProps): ReactElement {
  let className = 'upload-button';

  let invalidFormHelp: ReactNode;

  if (isNonEmptyString(props.className)) className += ' ' + props.className;

  if (props.disabled) {
    className += ' disabled';
    invalidFormHelp = (
      <p className="invalid-form-help">
        All required fields must be filled before upload.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={props.disabled ? undefined : props.onClick}
        disabled={props.disabled}
      >
        {props.buttonText ?? 'Upload Dataset'}
      </button>
      {invalidFormHelp}
    </>
  );
}
