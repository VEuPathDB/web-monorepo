import { Dispatch, FormEvent, ReactElement, SetStateAction, useState } from 'react';
import {
  FileUploadConfig,
  ResultUploadConfig,
  UrlUploadConfig,
} from '../../Configuration/UploadFormConfig';
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";
import { Consumer, isNonEmptyString, JsonPathBuilder } from "../../../../Utils";
import { UploadUrlParams } from "../DataModel";
import { RadioList } from "@veupathdb/wdk-client/lib/Components";
import { DatasetTypeConfig } from "../../Configuration";
import { formatFileSize } from "../../../../Utils/formatting";
import { DataFileInput } from "./DataFileInput";
import { VdiServiceMetadata } from "../../../../Service/model/response-decoders";

// region Root Dataset Data Input Component

export interface RootDataInputProps {
  readonly vdiConfig: VdiServiceMetadata;
  readonly dataType: DatasetTypeConfig;
  readonly urlParams?: UploadUrlParams;
  readonly fileUpload?: FileUploadProps;
  readonly urlUpload?: UrlUploadProps;
  readonly resultUpload?: ResultUploadProps;
  readonly pathBuilder: JsonPathBuilder;
}

type UploadType = 'file' | 'url' | 'result';

/**
 * Input(s) for users to upload dataset data files.
 *
 * The returned element may be a single input, or a RadioList of inputs based
 * on the input configuration.
 *
 * @constructor
 */
export function RootDataInput(props: RootDataInputProps): ReactElement {
  let uploadInputs = buildUploadInputConstructors(props);

  const [selectedInput, setSelectedInput] = useState(determineDefaultUploadType(props));

  if (uploadInputs.length === 0) {
    console.error('no upload types are allowed by the upload form configuration')
    return <div>No data uploads are permitted.</div>;
  }

  if (uploadInputs.length === 1)
    return uploadInputs[0][1]({ dataType: props.dataType, pathBuilder: props.pathBuilder, required: true });

  const radioListItems = uploadInputs.map(([kind, fn]) => ({
    value: kind,
    display: fn({
      dataType: props.dataType,
      required: selectedInput === kind,
      pathBuilder: props.pathBuilder,
    })
  }))

  return <RadioList
    name="upload-type"
    value={selectedInput}
    onChange={value => setSelectedInput(value as UploadType)}
    items={radioListItems}
  />;
}

type UploadInputConstructor = (fieldProps: UploadFieldProps) => ReactElement;

function buildUploadInputConstructors(props: RootDataInputProps): Array<[UploadType, UploadInputConstructor]> {
  const inputs: Array<[UploadType, (fieldProps: UploadFieldProps) => ReactElement]> = [];

  if (props.fileUpload?.enabled === true)
    inputs.push(['file', (fieldProps) => fileInput({
      ...props.fileUpload!,
      ...fieldProps,
    })]);

  if (props.urlUpload?.enabled === true)
    inputs.push(['url', (fieldProps) => urlInput({
      ...props.urlUpload!,
      ...fieldProps,
    })]);

  if (props.resultUpload?.enabled === true)
    inputs.push([ 'result', (fieldProps) => resultInput({
      ...props.resultUpload!,
      ...fieldProps,
    })]);

  return inputs;
}

function determineDefaultUploadType({
  urlParams,
  urlUpload,
  resultUpload,
}: RootDataInputProps): UploadType {
  if (resultUpload?.enabled === true) {
    if (isNonEmptyString(urlParams?.datasetStepId))
      return 'result';

    if (isNonEmptyString(urlParams?.datasetStrategyRootStepId) && resultUpload.offerStrategyUpload)
      return 'result';
  }

  if (urlUpload?.enabled === true && isNonEmptyString(urlParams?.datasetUrl))
    return 'url';

  return 'file';
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

export type FileUploadProps = FileUploadConfig & UploadFieldProps & {
  readonly setFile: Consumer<File | undefined>;
  readonly vdiConfig: VdiServiceMetadata;
};

function fileInput(props: FileUploadProps): ReactElement {
  const fieldName = props.pathBuilder.appendToString('dataFile');
  const className = props.required ? 'required' : undefined;
  const baseField = <DataFileInput
    fieldName={fieldName}
    dataType={props.dataType}
    required={props.required}
    setFile={props.setFile}
    vdiFeatures={props.vdiConfig.features}
  />;

  const helpText = props.helpText ?? (
    <div>
      Files cannot be greater than{' '}
      {formatFileSize(props.dataType.vdiConfig.maxFileSize)}.
    </div>
  );

  return (
    <>
      <label className={className} htmlFor={fieldName}>Data Files</label>
      {props.renderOverride ? props.renderOverride(baseField) : baseField}
      {helpText}
    </>
  );
}

// endregion File Input Sub-Component

// region URL Input Sub-Component

export type UrlUploadProps = UrlUploadConfig & UploadFieldProps;

function urlInput(
  props: UrlUploadProps,
): ReactElement {
  const fieldName = props.pathBuilder.appendToString('url');
  const className = props.required ? 'required' : undefined;
  const baseField = <input type="url" name={fieldName} id={fieldName} />;

  return (
    <>
      <label className={className}>Upload URL</label>
      {props.renderOverride ? props.renderOverride(baseField) : baseField}
    </>
  );
}

// endregion URL Input Sub-Component

// region Result Input Sub-Component

export type ResultUploadProps = ResultUploadConfig
  & UploadFieldProps
  & {
    readonly stepId: number;
    readonly setStepId: Dispatch<SetStateAction<number>>;
    readonly strategyOptions: Array<StrategySummary>;
  }

function resultInput(
  props: ResultUploadProps,
): ReactElement {
  const fieldName = props.pathBuilder.appendToString('url');
  const className = props.required ? 'required' : undefined;

  const selectItems = props.strategyOptions.map((opt) => (
    <option value={opt.rootStepId.toString()}>
      {opt.name + (opt.isSaved ? '' : '*')}
    </option>
  ));

  const onInput = (e: FormEvent<HTMLSelectElement>) => {
    if (!(typeof e.currentTarget?.value === 'string')) return;

    const value = e.currentTarget.value;

    if (value.length < 1) return;

    props.setStepId(parseInt(value));
  };

  const baseField = <select
    value={props.stepId.toString()}
    onInput={onInput}
    disabled={!props.enabled}
    name={fieldName}
    id={fieldName}
  >
    {selectItems}
  </select>;

  return (
    <>
      <label className={className} htmlFor={fieldName}>Upload Strategy</label>
      {props.renderOverride ? props.renderOverride(baseField) : baseField}
    </>
  );
}

// endregion Result Input Sub-Component
