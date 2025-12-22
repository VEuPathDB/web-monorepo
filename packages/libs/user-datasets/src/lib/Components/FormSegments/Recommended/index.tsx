import { ReactElement } from "react";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { StateField } from "../../../Utils/util-types";
import { DatasetFormData } from "../../FormTypes";
import { PublicationList } from "./PublicationList";
import { createRootListSectionProps } from "../../../Utils/field-selectors";

interface Props {
  readonly displayText: DisplayText["formDisplay"]["additionalInfo"]["recommended"];
  readonly formDataState: StateField<DatasetFormData>;
}

export function Recommended({ displayText, formDataState }: Props): ReactElement {
  return <div>
    <h3>{displayText.sectionHeader}</h3>

    <PublicationList
      displayText={displayText.publications}
      listState={createRootListSectionProps("publications", formDataState)} />

    <FundingList />

  </div>;
}