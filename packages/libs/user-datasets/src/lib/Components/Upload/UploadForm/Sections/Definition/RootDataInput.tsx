import { ReactElement, useState } from 'react';
import {
  DisabledFileUploadConfig,
  DisabledUrlUploadConfig,
  EnabledFileUploadConfig,
  EnabledUrlUploadConfig,
  FileUploadConfig,
  UrlUploadConfig,
} from '../../../Configuration/UploadFormConfig';
import {
  Consumer,
  isNonEmptyString,
  JsonPathBuilder,
} from '../../../../../Utils';
import { UploadUrlParams } from '../../DataModel';
import { RadioList } from '@veupathdb/wdk-client/lib/Components';
import { DatasetTypeConfig } from '../../../Configuration';
import { formatFileSize } from '../../../../../Utils/formatting';
import { DataFileInput } from './DataFileInput';
import { VdiServiceMetadata } from '../../../../../Service';

// region Root Dataset Data Input Component

export interface RootDataInputProps {
  readonly vdiConfig: VdiServiceMetadata;
  readonly dataType: DatasetTypeConfig;
  readonly urlParams: UploadUrlParams;
  readonly fileUpload: OptionalFileUploadProps;
  readonly urlUpload: OptionalUrlUploadProps;
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

  const [selectedInput, setSelectedInput] = useState(
    determineDefaultUploadType(props)
  );

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
    return <>
      {uploadInputs[0][1]}
      {helpText}
    </>;

  const radioListItems = uploadInputs.map(([kind, element]) => ({
    value: kind,
    display: element,
  }));

  return <>
    <RadioList
      name="upload-type"
      value={selectedInput}
      onChange={(value) => setSelectedInput(value as UploadType)}
      items={radioListItems}
    />
    {helpText}
  </>;
}

function buildUploadInputs(
  props: RootDataInputProps
): Array<[UploadType, ReactElement]> {
  const { fileUpload, urlUpload } = props;

  const inputs: Array<[UploadType, ReactElement]> = [];

  const count = (fileUpload.enabled ? 1 : 0) + (urlUpload.enabled ? 1 : 0);

  const fieldProps: UploadFieldProps = {
    required: count === 1,
    dataType: props.dataType,
    pathBuilder: props.pathBuilder,
  };

  if (fileUpload.enabled)
    inputs.push([
      'file',
      fileInput({
        ...fileUpload,
        ...fieldProps,
      }),
    ]);

  if (urlUpload.enabled)
    inputs.push([
      'url',
      urlInput({
        ...urlUpload,
        ...fieldProps,
      }),
    ]);

  return inputs;
}

function determineDefaultUploadType({
  urlParams,
  urlUpload,
}: RootDataInputProps): UploadType {
  return urlUpload?.enabled === true && isNonEmptyString(urlParams?.datasetUrl)
    ? 'url'
    : 'file';
}

// endregion Root Dataset Data Input Component

interface UploadFieldProps {
  readonly pathBuilder: JsonPathBuilder;

  /**
   * Whether the target upload field is required.
   *
   * This value is typically set by the `RootDataInput` type, but may be
   * provided an override value if necessary.
   */
  readonly required: boolean;

  readonly dataType: DatasetTypeConfig;
}

// region File Input Sub-Component

interface FileUploadState {
  readonly file: File | undefined;
  readonly setFile: Consumer<File | undefined>;
  readonly vdiConfig: VdiServiceMetadata;
}

type IncompleteFileUploadProps = FileUploadConfig & FileUploadState;
type FileUploadProps = UploadFieldProps & IncompleteFileUploadProps;

export type EnabledFileUploadProps = EnabledFileUploadConfig &
  IncompleteFileUploadProps;
export type DisabledFileUploadProps = DisabledFileUploadConfig &
  Partial<IncompleteFileUploadProps>;

export type OptionalFileUploadProps =
  | EnabledFileUploadProps
  | DisabledFileUploadProps;

function fileInput(props: FileUploadProps): ReactElement {
  const fieldName = props.pathBuilder.appendToString('dataFile');
  const className = props.required ? 'required' : undefined;
  const baseField = (
    <DataFileInput
      fieldName={fieldName}
      dataType={props.dataType}
      required={props.required}
      setFile={props.setFile}
      vdiFeatures={props.vdiConfig.features}
    />
  );

  const helpText = (
    <div className="column-2 file-input-help">
      {props.helpText ??
        'Files cannot be greater than ' +
          formatFileSize(props.dataType.vdiConfig.maxFileSize) +
          '.'}
    </div>
  );

  return (
    <>
      <label className={className} htmlFor={fieldName}>
        Data Files
      </label>
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
}

export type IncompleteUrlUploadProps = UrlUploadConfig & UrlUploadState;

export type UrlUploadProps = EnabledUrlUploadConfig &
  UrlUploadState &
  UploadFieldProps;

export type OptionalUrlUploadProps =
  | (EnabledUrlUploadConfig & IncompleteUrlUploadProps)
  | (DisabledUrlUploadConfig & Partial<IncompleteUrlUploadProps>);

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
