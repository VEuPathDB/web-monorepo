import React, { HTMLAttributes, ReactElement, ReactNode } from "react";
import { TextBox } from "@veupathdb/wdk-client/lib/Components";
import { RequiredHeader, RequiredInformationProps } from "./common";
import { UploadSection } from "../DataInputs";
import { DataUploadType, UploadFormConfig } from "../../FormTypes";
import { UrlParams } from "../../FormTypes/form-config";
import { rootValueSelector } from "../../../Utils/field-selectors";
import { VisibilityRadio } from "../DataInputs/VisibilityRadio";
import { DatasetVisibility } from "../../../Service/Types";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";


export function GenomicsDatasetDetails({
  formConfig,
  displayText: { formDisplay: { requiredInfo: formDisplayText } },
  vdiConfig,
  urlParams,
  strategyOptions,
  resultUploadConfig,
  metaFormState: [ inputValues, setInputValues ],
  dataUploadState,
  docFileState: [ docUploads, setDocUploads ],
}: RequiredInformationProps): ReactElement {
  const visibilityOptions: DatasetVisibility[] = [ "private", "public" ];

  const uploadMethodItems = urlParams.useFixedUploadMethod === "true"
    ? <></>
    : UploadSection({ formConfig, resultUploadConfig, strategyOptions, urlParams });

  return <div className="requiredFields">
    <RequiredHeader displayText={formDisplayText}/>

    <LabeledTextInput
      id="dataset-name"
      label={formDisplayText.nameFieldLabel}
      required={true}
      {...rootValueSelector("name", datasetMeta, setDatasetMeta)}
    />

    <LabeledTextInput
      id="dataset-summary"
      label={formDisplayText.summaryFieldLabel}
      placeholder={formDisplayText.summaryPlaceholder}
      required={true}
      {...rootValueSelector("summary", datasetMeta, setDatasetMeta)}
    />

    {
      formConfig.dependencies
        ? <div className="datasetDependencies">
          <label>Reference genome</label>
          {formConfig.dependencies.render({
            value: [],
            onChange: v => {},
          })}
        </div>
        : null
    }

    {uploadMethodItems}

    <VisibilityRadio
      fieldName="dataset-visibility"
      enabledVisibilities={visibilityOptions}
      {...rootValueSelector("visibility", datasetMeta, setDatasetMeta)}
    />
  </div>;
}

interface LabeledTextInputProps extends Omit<HTMLAttributes<string>, "onChange"> {
  readonly id: string;
  readonly label: NonNullable<ReactNode>;

  readonly value?: string;
  readonly onChange: (v: string) => void;

  readonly placeholder?: string;
  readonly required?: boolean;
}

function LabeledTextInput({
  value,
  id,
  onChange,
  placeholder,
  required,
  ...props
}: LabeledTextInputProps): ReactElement {
  return <LabeledInput {...props}>
    <TextBox {...{ id, value, onChange, placeholder, required }}/>
  </LabeledInput>;
}

interface LabeledInputProps extends HTMLAttributes<any> {
  readonly label: NonNullable<ReactNode>;
  readonly children: ReactElement<HTMLAttributes<any>>;
}

function LabeledInput({ label, children, ...props }: LabeledInputProps): ReactElement {
  return <div {...props}>
    <label htmlFor={children.props.id}>{label}</label>
    {children}
  </div>;
}

function initialUploadMode(
  config: UploadFormConfig,
  urlParams: UrlParams,
  strategyOptions: StrategySummary[],
): DataUploadType {
  if (urlParams.datasetStrategyRootStepId) {
    const displayStrategyUpload = config.uploadMethodConfigs
      .some(c => c.asKind(DataUploadType.Result)?.offerStrategyUpload === true);

    if (displayStrategyUpload && strategyOptions.length > 0)
      return DataUploadType.Result;
  }

  if (urlParams.datasetUrl) {
    const displayUrlUpload = config.uploadMethodConfigs
      .some(c => c.asKind(DataUploadType.URL)?.offer === true)

    if (displayUrlUpload)
      return DataUploadType.URL;
  }

  return DataUploadType.SingleFile;
}
