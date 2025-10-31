import React, { ReactElement } from "react";
import { FieldLabel } from "../FieldLabel";
import { cx } from "../component-utils";
import { FileInput } from "@veupathdb/wdk-client/lib/Components";
import { SingleFileUploadConfig } from "../../FormTypes/form-config";
import { newSingleFileUpload } from "../../FormTypes";


export function DataFileInput(props: SingleFileUploadConfig): ReactElement {
  const input = props.render
    ? props.render({
      vdiConfig: props.vdiConfig,
      installer: props.installer,
      formField: () => newDefaultFileInput(props)
    })
    : newDefaultFileInput(props);

  return <>
    <FieldLabel htmlFor="data-set-file">{props.label}</FieldLabel>
    <div id="data-set-file" className={cx("--UploadMethodField")}>
      {input}
    </div>
  </>;
}

function newDefaultFileInput({
  fieldState: [ _, setUpload ],
  ...props
}: SingleFileUploadConfig): ReactElement {
  return <FileInput
    accept={props.installer.allowedFileExtensions?.join(",") || undefined}
    maxSizeBytes={props.installer.maxFileSize}
    onChange={file => setUpload(
      file != null
        ? newSingleFileUpload(new File(
          [ file ],
          file?.name.replace(/\s+/g, "_"),
          file,
        ))
        : undefined
    )}
  />;
}
