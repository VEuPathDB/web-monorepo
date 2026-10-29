import React, { ReactElement, useState } from 'react';
import { FileUploadConfig, UrlUploadConfig } from '../../../../Configuration/UploadFormConfig';
import { Consumer, JsonPathBuilder, Possible } from '../../../../../Utils';
import { RadioList } from '@veupathdb/wdk-client/lib/Components';
import { DatasetTypeConfig } from '../../../../Configuration';
import { formatFileSize } from '../../../../../Utils/formatting';
import { DataFileInputList } from './DataFileInput';
import { VdiServiceMetadata } from '../../../../../Service';
import { UploadContentMap } from '../../../../../Service/Model/utility-types';

// region Root Dataset Data Input Component

export interface RootDataInputProps {
  readonly vdiConfig: VdiServiceMetadata;
  readonly dataType: DatasetTypeConfig;
  readonly fileUpload?: FileUploadProps;
  readonly urlUpload?: UrlUploadProps;
  readonly pathBuilder: JsonPathBuilder;
  readonly helpText?: () => ReactElement;
}

type UploadType = 'file' | 'url';

/**
 * Input(s) for users to upload dataset data files.
 *
 * The returned element may be a single input, or a RadioList of inputs based
 * on the input configuration.
 *
 * @constructor
 */
export function RootDataInput(props: RootDataInputProps): ReactElement {
  let uploadInputs = buildUploadInputs(props);

  const [selectedInput, setSelectedInput] = useState<UploadType>('file');

  if (uploadInputs.length === 0) {
    console.error(
      'no upload types are allowed by the upload form configuration'
    );
    return <div>No data uploads are permitted.</div>;
  }

  const helpText =
    typeof props.helpText === 'function' ? (
      <div className="column-2">{props.helpText()}</div>
    ) : undefined;

  if (uploadInputs.length === 1)
    return (
      <>
        {uploadInputs[0][1]}
        {helpText}
      </>
    );

  const radioListItems = uploadInputs.map(([kind, element]) => ({
    value: kind,
    display: element,
  }));

  return (
    <>
      <RadioList
        name="upload-type"
        value={selectedInput}
        onChange={(value) => setSelectedInput(value as UploadType)}
        items={radioListItems}
      />
      {helpText}
    </>
  );
}

function buildUploadInputs(
  props: RootDataInputProps
): Array<[UploadType, ReactElement]> {
  const { fileUpload, urlUpload } = props;

  const inputs: Array<[UploadType, ReactElement]> = [];

  const fieldProps: UploadFieldProps = {
    dataType: props.dataType,
    pathBuilder: props.pathBuilder,
  };

  if (fileUpload !== undefined)
    inputs.push([
      'file',
      fileInput({
        ...fileUpload,
        ...fieldProps,
      }),
    ]);

  if (urlUpload !== undefined)
    inputs.push([
      'url',
      urlInput({
        ...urlUpload,
        ...fieldProps,
      }),
    ]);

  return inputs;
}

// endregion Root Dataset Data Input Component

interface UploadFieldProps {
  readonly pathBuilder: JsonPathBuilder;

  readonly dataType: DatasetTypeConfig;
}

// region File Input Sub-Component

interface FileUploadState {
  readonly files: Possible<UploadContentMap>;
  readonly setFiles: Consumer<UploadContentMap>;
  readonly vdiConfig: VdiServiceMetadata;
}

export type FileUploadProps = UploadFieldProps & FileUploadConfig & FileUploadState;

function fileInput(props: FileUploadProps): ReactElement {
  const fieldName = props.pathBuilder.appendToString('dataFile');

  const baseField = (
    <DataFileInputList
      dataType={props.dataType}
      vdiFeatures={props.vdiConfig.features}
      inputConfigs={props.fileInputs ?? []}
      files={props.files}
      setFiles={props.setFiles}
      fieldName={fieldName}
    />
  );

  const helpText = (
    <div className="column-2 file-input-help">
      <i>{
        props.helpText !== undefined
          ? props.helpText
          : 'Uncompressed file cannot be greater than ' +
            formatFileSize(props.dataType.vdiConfig.maxFileSize) + '.'
      }</i>
    </div>
  );

  return (
    <>
      {props.renderOverride ? props.renderOverride(baseField) : baseField}
      {helpText}
    </>
  );
}

// endregion File Input Sub-Component

// region URL Input Sub-Component

interface UrlUploadState {
  readonly url: string;
  readonly setUrl: Consumer<string>;
  readonly required: boolean;
}

export type UrlUploadProps = UrlUploadConfig &
  UrlUploadState &
  UploadFieldProps;

function urlInput(props: UrlUploadProps): ReactElement {
  const fieldName = props.pathBuilder.appendToString('url');
  const className = props.required ? 'required' : undefined;
  const baseField = (
    <input
      type="url"
      name={fieldName}
      id={fieldName}
      value={props.url}
      onChange={(e) => props.setUrl(e.currentTarget.value)}
    />
  );

  return (
    <>
      <label className={className}>Upload URL</label>
      {props.renderOverride ? props.renderOverride(baseField) : baseField}
    </>
  );
}

// endregion URL Input Sub-Component
