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
}

export function DataFileInput(props: DataFileInputProps): ReactElement {
  return (
    <>
      <input
        type="file"
        accept={buildFileExtensionList(
          props.vdiFeatures.supportedArchiveTypes,
          props.dataType.vdiConfig.allowedFileExtensions
        )}
        id={props.fieldName}
        name={props.fieldName}
        required={props.required}
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
