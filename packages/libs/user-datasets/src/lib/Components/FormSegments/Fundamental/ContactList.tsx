import React, { ReactElement } from "react";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { DatasetFormData } from "../../FormTypes";
import { FieldSetter } from "../../../Utils/util-types";

interface Props {
  readonly formData: DatasetFormData
  readonly setter: FieldSetter<DatasetFormData>

  readonly displayText: DisplayText["formDisplay"]["additionalInfo"]["fundamentals"]["contacts"];
}

export function ContactList(props: Props): ReactElement {
  return <>

  </>;
}