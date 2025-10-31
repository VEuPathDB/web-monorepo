import { ReactElement } from "react";
import { DatasetFormData, DataUpload, MetaFileUpload, UploadFormConfig } from "../../FormTypes";
import { ServiceConfiguration } from "../../../Service/Types/service-types";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";
import { UrlParams } from "../../FormTypes/form-config";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { FieldSetter } from "../../../Utils/util-types";

import "./common.scss";
import { ResultUploadConfig } from "../../../Utils/types";

export function RequiredHeader(props: { displayText: DisplayText["formDisplay"]["requiredInfo"] }): ReactElement {
  return <span className="requiredDatasetInfoHeader">{props.displayText.title}</span>;
}

export interface RequiredInformationProps {
  readonly formConfig: UploadFormConfig;
  readonly displayText: DisplayText;
  readonly vdiConfig: ServiceConfiguration;
  readonly urlParams: UrlParams;
  readonly strategyOptions: StrategySummary[];
  readonly resultUploadConfig?: ResultUploadConfig;

  readonly metaFormState: [ DatasetFormData, FieldSetter<DatasetFormData> ];
  readonly dataUploadState: [ DataUpload | undefined, FieldSetter<DataUpload | undefined> ];
  readonly docFileState: [ MetaFileUpload[], FieldSetter<MetaFileUpload[]> ];
}
