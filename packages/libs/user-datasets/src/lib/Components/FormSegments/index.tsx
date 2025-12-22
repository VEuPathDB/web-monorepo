import { ReactElement } from "react";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { StateField } from "../../Utils/util-types";
import { DatasetFormData, MetaFileUpload } from "../FormTypes";
import { Fundamentals } from "./Fundamental";

export { ErrorMessage } from "./ErrorMessage";
export { FieldLabel, type FieldLabelProps } from "./FieldLabel";
export { HyperlinkInputList } from "./HyperlinkReferenceInput";
export { LinkedDatasetInputList } from "./LinkedDatasetInput";
export { PublicationInputList } from "./PublicationInputList";
export { UploadProgress } from "./UploadProgress";
export { DoiRefInputList } from "./DoiReferenceInput";
export { BioprojectIdRefInputList } from "./BioprojectIdInput";

export { useStudyDesignSegment } from "./StudyDesignType";

export { newArrayInputUpdater } from "./component-utils";

interface Props {
  readonly displayText: DisplayText['formDisplay']['additionalInfo'];
  readonly formDataState: StateField<DatasetFormData>;
  readonly dictFileState: StateField<File | undefined>;
  readonly docFileState: StateField<MetaFileUpload[]>;
}

export function AdditionalInformation({
  dictFileState,
  displayText,
  docFileState,
  formDataState,
}: Props): ReactElement {
  return <div id="dataset-upload-addtl-info">
    <h2>{displayText.title}</h2>

    <Fundamentals
      formDataState={formDataState}
      dictFileState={dictFileState}
      displayText={displayText.fundamentals} />

  </div>;
}