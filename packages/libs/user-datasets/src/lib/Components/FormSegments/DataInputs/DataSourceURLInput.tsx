import React, { ReactElement } from "react";
import { FieldLabel } from "../FieldLabel";
import { TextBox } from "@veupathdb/wdk-client/lib/Components";
import { cx } from "../component-utils";
import { UrlUploadConfig } from "../../FormTypes/form-config";
import { DataUploadType, newUrlUpload } from "../../FormTypes";

export function DataSourceURLInput({
  fieldState: [ upload, setUpload ],
  ...props
}: UrlUploadConfig): ReactElement {
  return <>
    <FieldLabel htmlFor="data-set-url">{props.label}</FieldLabel>
    <TextBox
      type="input"
      className={cx("--UploadMethodField")}
      id="data-set-url"
      placeholder={props.inputPlaceholder}
      value={upload?.kind === DataUploadType.URL ? upload.url : undefined}
      onChange={url => setUpload(url != null ? newUrlUpload(url) : undefined)}
    />
  </>;
}
