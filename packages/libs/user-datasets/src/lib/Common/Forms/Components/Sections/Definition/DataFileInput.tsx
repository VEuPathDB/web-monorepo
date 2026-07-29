import React, { ReactElement } from 'react';
import { DatasetTypeConfig } from '../../../../Configuration';
import { VdiServiceFeatures } from '../../../../../Service';
import { Consumer, Nullable } from '../../../../../Utils';

export interface DataFileInputProps {
  readonly fieldName: string;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;
  readonly required: boolean;
  readonly setFile: Consumer<Nullable<FileList>>;
  readonly accept?: string;
  readonly disabled?: boolean;
  readonly buttonText?: string;
}

export function DataFileInput(props: DataFileInputProps): ReactElement {
  const acceptValue =
    props.accept ??
    buildFileExtensionList(
      props.vdiFeatures.supportedArchiveTypes,
      props.dataType.vdiConfig.allowedFileExtensions
    );

  const [fileName, setFileName] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setFile(e.target.files);
    setFileName(e.target.files?.[0]?.name || '');
  };

  // If custom button text is provided, use a styled approach with CSS
  if (props.buttonText) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
      <>
        <style>{`
          input[type="file"].custom-file-button::file-selector-button {
            padding: 8px;
            margin: 0 1ch 0 0;
            cursor: ${props.disabled ? 'not-allowed' : 'pointer'};
            opacity: ${props.disabled ? 0.6 : 1};
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptValue}
            id={props.fieldName}
            name={props.fieldName}
            required={props.required}
            disabled={props.disabled}
            onChange={handleChange}
            className="custom-file-button"
            style={{ display: 'none' }}
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
      </>
    );
  }

  // Default standard file input
  return (
    <>
      <input
        type="file"
        accept={acceptValue}
        id={props.fieldName}
        name={props.fieldName}
        required={props.required}
        disabled={props.disabled}
        onChange={(e) => props.setFile(e.target.files)}
      />
    </>
  );
}

function buildFileExtensionList(
  coreExtensions: string[],
  dataTypeExtensions: string[]
): string {
  const joined = [];

  for (const ext of dataTypeExtensions) joined.push(sanitizeFileExtension(ext));

  for (const ext of coreExtensions) joined.push(sanitizeFileExtension(ext));

  return joined.join(',');
}

/**
 * Trim multi-segment file extensions due to a mac-specific chromium file
 * browser bug which prevents such files from being selected.
 *
 * This issue was still being reported in 2023.
 */
function sanitizeFileExtension(ext: string): string {
  const i = ext.lastIndexOf('.');

  if (i === 0) return ext;

  if (i < 0) return '.' + ext;

  return ext.substring(i);
}
