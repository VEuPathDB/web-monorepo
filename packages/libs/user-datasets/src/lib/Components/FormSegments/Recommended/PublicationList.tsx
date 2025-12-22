import { ReactElement } from "react";
import { CollapsibleSection } from "@veupathdb/wdk-client/lib/Components";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { doNothing } from "../../../Utils/utils";
import { Publication } from "./Publication";
import { DatasetPublication } from "../../../Service/Types";
import { ListSectionProps } from "../../../Utils/field-selectors";

interface Props {
  readonly displayText: DisplayText['formDisplay']['additionalInfo']['recommended']['publications'];
  readonly listState: ListSectionProps<DatasetPublication>;
}

export function PublicationList({
  displayText,
  listState: { records, setRecords },
}: Props): ReactElement {
  return <CollapsibleSection headerContent={displayText.sectionHeader} onCollapsedChange={doNothing}>
    {records.map((publication, index) =>
      Publication({ displayText, index, publication, updater: setRecords }))}
  </CollapsibleSection>;
}
