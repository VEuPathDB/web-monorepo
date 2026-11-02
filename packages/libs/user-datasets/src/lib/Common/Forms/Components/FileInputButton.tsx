import React from 'react';
import { Consumer, Possible } from '../../../Utils';
import { newUploadContent, UploadContent } from '../../../Service/Model';
import { sanitizeFileName } from '../../../Service/utils/sanitization';

export interface FileInputButtonProps {
  readonly fieldName: string;
  readonly buttonText: string;

  readonly accept?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;

  readonly fileSelection: Possible<ReadonlyArray<UploadContent>>;
  readonly setFileSelection: Consumer<Array<UploadContent>>;
}

export function FileInputButton(props: FileInputButtonProps): React.ReactElement {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.setFileSelection(Array.from(e.target.files ?? [])
      .map(it => newUploadContent(sanitizeFileName(it))));

  const fileName = props.fileSelection
    ?.map(it => it.name)
    ?.join(', ');

  return (
    <div className="file-input-button">
      <input
        ref={fileInputRef}
        type="file"
        accept={props.accept}
        id={props.fieldName}
        name={props.fieldName}
        required={props.required}
        disabled={props.disabled}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
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