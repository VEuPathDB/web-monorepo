import { ReactElement } from "react";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { TextBox } from "@veupathdb/wdk-client/lib/Components";


interface Props {
  readonly displayText: DisplayText["formDisplay"]["additionalInfo"]["fundamentals"];
}

export function Fundamentals(props: Props): ReactElement {
// File must:
// be in .csv, .tsv, or tab-delimited .txt format
// contain one row for every variable in the data file.
// include columns labeled (i) variable; (ii) label; (iii) definition
//
// See ‘Help’ for more information on how to properly format your data dictionary
}

function Contacts(): ReactElement {
  // TODO: wrap this in a box
  return <>

  </>;
}

function ContactInfo(): ReactElement {
  return <>
    <TextBox />
  </>;
}