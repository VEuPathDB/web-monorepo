import { ReactElement } from 'react';
import { isNonEmptyString } from "../../../../Utils";

export interface UploadButtonProps {
  readonly buttonText?: string;
  readonly onClick: () => void;
  readonly className?: string;
}

export function UploadButton(props: UploadButtonProps): ReactElement {
  const className = isNonEmptyString(props.className)
    ? props.className + ' upload-button'
    : 'upload-button';

  return (
    <button type="button" className={className} onClick={props.onClick}>
      {props.buttonText ?? 'Upload Dataset'}
    </button>
  );
}
