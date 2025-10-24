import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { FieldLabel } from "../FieldLabel";
import { TextBox } from "@veupathdb/wdk-client/lib/Components";
import { cx } from "../component-utils";

interface Props {
  readonly url?: string;
  readonly setUrl: Dispatch<SetStateAction<string>>;
}

export function DataSourceURLInput(props: Props): ReactElement {
  return <>
    <FieldLabel htmlFor="data-set-url">Upload URL</FieldLabel>
    <TextBox
      type="input"
      className={cx("--UploadMethodField")}
      id="data-set-url"
      placeholder="Address of a data file from the Web"
      value={props.url}
      onChange={props.setUrl}
    />
  </>;
}
