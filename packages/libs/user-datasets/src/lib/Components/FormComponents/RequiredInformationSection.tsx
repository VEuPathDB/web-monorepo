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
import { LabeledTextInput } from "./LabeledInput";
import { DatasetVisibility } from "../../Service/Types";
import { DatasetUploadFormConfig } from "../FormTypes";


function RequiredHeader(): ReactElement {
  return <span className="requiredDatasetInfoHeader">Required Information</span>;
}

interface RequiredInformationProps {
  config: DatasetUploadFormConfig
}

function RequiredGenomicsInformation(props: RequiredInformationProps): ReactElement {
  const [ name, setName ] = useState<string>();
  const [ summary, setSummary ] = useState<string>();
  const [ visibility, setVisibility ] = useState<DatasetVisibility>("private")

  const [ useFile, setUseFile ] = useState(true);

  return <div className="requiredFields">
    <RequiredHeader/>

    <LabeledTextInput
      id="dataset-name"
      label="Data set name"
      value={name}
      onChange={setName}
      required={true}
    />

    <LabeledTextInput
      id="dataset-summary"
      label="Summary"
      value={summary}
      onChange={setSummary}
      required={true}
    />

    {
      props.config.formConfig.dependencies
        ? <div className="datasetDependencies">
          <label>Reference genome</label>
          {props.config.formConfig.dependencies.render()}
        </div>
        : null
    }

    <div>
      {
        useFile
          ? <>
            <label>Upload a file</label>
            <FileInput
            />
            <span className="uploadToUrlToggle">Or provide a <button onClick={() => setUseFile(false)}>link from the web</button>.</span>
          </>
          : <>
            <label>Link from the web</label>
            <TextBox />
            <span className="uploadToUrlToggle"> | <button onClick={() => setUseFile(true)}>Cancel</button></span>
          </>
      }
    </div>

    <VisibilityRadio
      name="dataset-visibility"
      onChange={v => setVisibility(v as DatasetVisibility)}
      value={visibility}
    />
  </div>;
}

function RequiredMBioInformation(): ReactElement {
  return <div className="requiredFields">
    <RequiredHeader/>
    <label htmlFor={}></label>
  </div>;
}

function RequiredClinEpiInformation(): ReactElement {
  return <div className="requiredFields">
    <RequiredHeader/>
    <label htmlFor={}></label>
  </div>;
}

interface RadioOption {
  readonly display: string;
  readonly value: DatasetVisibility;
  readonly description: string;
}

interface VisibilityProps {
  readonly name: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
}

function VisibilityRadio(props: VisibilityProps): ReactElement {
  const items = [
    { value: "private", display: "Private", description: "visible only to you and collaborators with shared access" },
    { value: "public", display: "Public", description: "visible to all users" },
  ] as RadioOption[];

  return <div className="datasetVisibility">
    <label>Data accessibility</label>
    <RadioList items={items} {...props} />
  </div>
}


interface LabeledTextInputProps extends Omit<HTMLAttributes<string>, 'onChange'> {
  readonly id: string;
  readonly label: string;

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
  readonly label: string;
  readonly children: ReactElement<HTMLAttributes<any>>;
}

function LabeledInput({ label, children, ...props }: LabeledInputProps): ReactElement {
  return <div {...props}>
    <label htmlFor={children.props.id}>{label}</label>
    {children}
  </div>;
}