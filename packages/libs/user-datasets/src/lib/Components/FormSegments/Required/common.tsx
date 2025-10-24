import { ReactElement, ReactNode } from "react";
import { UploadFormConfig } from "../../FormTypes";

import "./common.scss";
import { DatasetVisibility } from "../../../Service/Types";
import { RadioList } from "@veupathdb/wdk-client/lib/Components";

export function RequiredHeader(): ReactElement {
  return <span className="requiredDatasetInfoHeader">Required Information</span>;
}

export interface RequiredInformationProps {
  config: UploadFormConfig
}

// region Common Visibility Options

/**
 * Form-specific dataset visibility options.
 *
 * The visibility value "controlled" is not a VDI visibility option, but is
 * the combination of the
 */
export type ExtendedDatasetVisibility = DatasetVisibility | "controlled";

/**
 * Available dataset visibility option form display value definitions.
 */
const visibilities = [
  {
    display: "Private",
    value: "private",
    description: "Can only be accessed by you and collaborators explicitly" +
      " granted access by you.",
  },
  {
    display: "Protected",
    value: "protected",
    description: <>
      <span>
        Guest users can view aggregated data via the "Browse and subset" and
        "Visualize" tabs, but must register, request, and obtain approval from
        the data providers to download data. The request may be submitted via a
        form that pops up when a registered user is logged in and clicks on any
        file in the "Download" tab.
      </span>
      <ul>
        <li>
          <strong>Active approval:</strong>
          <span>Access must be explicitly approved by the study team.</span>
        </li>
        <li>
          <strong>Passive approval:</strong>
          <span>
            Access is automatically granted after the defined "review period".
          </span>
        </li>
      </ul>
    </>
  },
  {
    display: "Controlled",
    value: "controlled",
    description: "Guest users can view aggregated data via the \"Browse and" +
      " subset\" and \"Visualize\" tabs, but must register and request access" +
      " to download data. The request may be submitted via a form that pops" +
      " up when a user logs in with a registered account and clicks on any" +
      " file in the \"Download\" tab. Data can be downloaded by the" +
      " registered user immediately following request submission."
  },
  {
    display: "Public",
    value: "public",
    description: "Accessible by all users with no access restrictions. Users" +
      " can view and download the data as \"Guests\" without logging in."
  },
] as readonly RadioOption[];

interface RadioOption {
  readonly display: NonNullable<ReactNode>;
  readonly description: NonNullable<ReactNode>;
  readonly value: ExtendedDatasetVisibility;
}

interface VisibilityProps {
  readonly fieldName: string;
  readonly value: ExtendedDatasetVisibility;
  readonly onChange: (v: ExtendedDatasetVisibility) => void;
  readonly enabledVisibilities: ExtendedDatasetVisibility[];
}

export function VisibilityRadio(props: VisibilityProps): ReactElement {
  const items = visibilities.filter(opt => props.enabledVisibilities.find(vis => opt.value === vis));
  const onChange = (v: string) => props.onChange(v as ExtendedDatasetVisibility);

  return <div className="datasetVisibility">
    <label>Data accessibility</label>
    <RadioList items={items} onChange={onChange} name={props.fieldName} value={props.value} />
  </div>
}

// endregion Common Visibility Options