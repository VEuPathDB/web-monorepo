import { StateField } from "../../../Utils/util-types";
import { DatasetFormData } from "../../FormTypes";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { ReactElement } from "react";
import { doNothing, ifExists, resolveNewState, sanitizeFilename, TODO } from "../../../Utils/utils";
import { CollapsibleSection, FileInput } from "@veupathdb/wdk-client/lib/Components";
import { ContactInfo } from "./ContactInfo";

interface Props {
  readonly formDataState: StateField<DatasetFormData>;
  readonly dictFileState: StateField<File | undefined>;
  readonly displayText: DisplayText["formDisplay"]["additionalInfo"]["fundamentals"];
}

/**
 * "Fundamentals" form section.
 *
 * Contains collapsible blocks for:
 * * Data dictionary file input (if enabled for data type).
 * * Dataset contact inputs.
 *
 * @constructor
 */
export function Fundamentals({
  displayText,
  formDataState: [ formData, setFormData ],
  dictFileState: [ _, setDictFile ],
}: Props): ReactElement {
  TODO("only show data dict block when enabled!");
  TODO("primary contact required when visibility is public or controlled!");

  return <>
    <CollapsibleSection
      headerContent={displayText.dataDictionary.sectionHeader}
      onCollapsedChange={doNothing}
    >{
      <FileInput
        accept={TODO("dict file allowed file types")}
        maxSizeBytes={TODO("dict file max upload size option")}
        onChange={it => setDictFile(ifExists(it, file => new File([ file ], sanitizeFilename(file), file)))}
      />
    }</CollapsibleSection>

    <CollapsibleSection
      headerContent={displayText.contacts.sectionHeader}
      onCollapsedChange={doNothing}
    >{(formData.contacts ?? []).map((it, i) => ContactInfo({
      index: i,
      contact: it,
      displayText: displayText.contacts,
      updater: update => setFormData(prev => ({ ...prev, contacts: resolveNewState(update, prev.contacts ?? []) })),
    }))}</CollapsibleSection>
  </>;
}
