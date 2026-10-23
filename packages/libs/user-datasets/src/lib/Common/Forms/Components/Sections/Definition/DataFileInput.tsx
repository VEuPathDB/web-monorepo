import React, { ReactElement } from 'react';
import { DatasetTypeConfig } from '../../../../Configuration';
import { VdiServiceFeatures } from '../../../../../Service';
import { Consumer, Nullable, Possible } from '../../../../../Utils';
import { FileInputConfig } from '../../../../Configuration/UploadFormConfig';
import { filterNullish } from '../../../../../Utils/miscellaneous-junk';
import { FileInputButton } from '../../FileInputButton';
import { UploadContent } from '../../../../../Service/Model';
import { UploadContentMap } from '../../../../../Service/Model/utility-types';

export interface DataFileInputListProps {
  readonly fieldName: string;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;
  readonly inputConfigs: readonly FileInputConfig[];
  readonly disabled?: boolean;
  readonly setFiles: Consumer<UploadContentMap>;
  readonly files: Possible<UploadContentMap>;
}

export function DataFileInputList(props: DataFileInputListProps): Nullable<ReactElement> {
  const inputs = props.inputConfigs
    .map((it, i) => {
      const fieldName: string = `${props.fieldName}[${i}]`;

      return DataFileInput({
        ...props,
        fieldName,
        inputConfig: it,
        files: props.files?.[fieldName],
        setFiles: (files) => {
          props.setFiles({ ...(props.files ?? {}), [fieldName]: filterNullish(files) });
        },
      });
    });
  return <>{inputs}</>;
}

export interface DataFileInputProps {
  readonly fieldName: string;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;

  readonly disabled?: boolean;

  readonly inputConfig: FileInputConfig;

  readonly setFiles: Consumer<ReadonlyArray<UploadContent>>;
  readonly files: Possible<ReadonlyArray<UploadContent>>;

}

export function DataFileInput(props: DataFileInputProps): ReactElement {
  const { inputConfig } = props;

  const acceptValue =
    inputConfig.accept ??
    buildFileExtensionList(
      props.vdiFeatures.supportedArchiveTypes,
      props.dataType.vdiConfig.allowedFileExtensions
    );


  const buttonText = inputConfig.buttonText ?? "Choose file";

  const className = props.inputConfig.required ? 'required' : undefined;

  return (
    <>
      <label className={className} htmlFor={props.fieldName}>
        {inputConfig.label ?? 'Data File'}
      </label>

      <FileInputButton
        fieldName={props.fieldName}
        buttonText={buttonText}
        fileSelection={props.files}
        setFileSelection={props.setFiles}
        accept={acceptValue}
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
