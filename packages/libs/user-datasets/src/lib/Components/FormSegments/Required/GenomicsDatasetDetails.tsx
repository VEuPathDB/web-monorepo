// Study name | Dataset name
// summary
// reference genome
// data file | url
// accessibility
// design + type
// data type
// approval type
// review period

import { HTMLAttributes, ReactElement, ReactNode, useState } from "react";
import { FileInput, RadioList, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { VariableDisplayText } from "../../FormTypes";
import {
  ExtendedDatasetVisibility,
  RequiredHeader,
  RequiredInformationProps,
  VisibilityRadio
} from "./common";


// FIXME: Move this function to wherever the route is decided!
export function newGenomicsDisplayText(): VariableDisplayText {
  return {
    datasetNameLabel: "Data set name",
    summaryPlaceholder: "Provide a concise summary of the data set (max 400 characters)."
  };
}

const visibilityOptions = [ "private", "public" ] as ExtendedDatasetVisibility[];

function GenomicsDatasetDetails({ config }: RequiredInformationProps): ReactElement {
  const displayText = config.displayText;

  const [ name, setName ] = useState<string>();
  const [ summary, setSummary ] = useState<string>();
  const [ visibility, setVisibility ] = useState<ExtendedDatasetVisibility>("private")

  const [ useFile, setUseFile ] = useState(true);

  return <div className="requiredFields">
    <RequiredHeader/>

    <LabeledTextInput
      id="dataset-name"
      label={displayText.datasetNameLabel}
      value={name}
      onChange={setName}
      required={true}
    />

    <LabeledTextInput
      id="dataset-summary"
      label="Summary"
      value={summary}
      onChange={setSummary}
      placeholder={displayText.summaryPlaceholder}
      required={true}
    />

    {
      config.dependencies
        ? <div className="datasetDependencies">
          <label>Reference genome</label>
          {config.dependencies.render({
            value: [],
            onChange: v => {}
          })}
        </div>
        : null
    }

    <div>
      {
        useFile
          ? <>
            <label>Upload a file</label>
            {/*<FileInput*/}
            {/*/>*/}
            <span className="uploadToUrlToggle">Or provide a <button onClick={() => setUseFile(false)}>link from the web</button>.</span>
          </>
          : <>
            <label>Link from the web</label>
            {/*<TextBox />*/}
            <span className="uploadToUrlToggle"> | <button onClick={() => setUseFile(true)}>Cancel</button></span>
          </>
      }
    </div>

    <VisibilityRadio
      fieldName="dataset-visibility"
      onChange={setVisibility}
      value={visibility}
      enabledVisibilities={visibilityOptions}
    />
  </div>;
}

interface LabeledTextInputProps extends Omit<HTMLAttributes<string>, 'onChange'> {
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
  </LabeledInput>
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