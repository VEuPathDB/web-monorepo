import React, { ReactElement } from 'react';
import { DatasetTypeConfig, FileInputConfig } from '../../../../Configuration';
import { VdiServiceFeatures } from '../../../../../Service';
import { Consumer, Nullable, Possible, filterNullish } from '../../../../../Utils';
import { FileInputButton } from '../../';
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
  const configs: Array<DataFileInputProps> = props.inputConfigs
    .map((it, i) => {
      const fieldName: string = `${props.fieldName}[${i}]`;

      return {
        ...props,
        fieldName,
        inputIndex: i,
        inputConfig: it,
        files: props.files?.[fieldName],
        setFiles: (files) => {
          props.setFiles({ ...(props.files ?? {}), [fieldName]: filterNullish(files) });
        },
      };
    });

  for (const config of configs) {
    if (config.inputConfig.configOverride) {
      configs[config.inputIndex] = config.inputConfig.configOverride(config, configs);
    }
  }


  return <>{configs.map(DataFileInput)}</>;
}

export interface DataFileInputProps {
  readonly fieldName: string;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;

  readonly inputConfigs: ReadonlyArray<FileInputConfig>;
  readonly inputIndex: number;

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
        disabled={props.disabled}
        required={props.inputConfig.required}
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
