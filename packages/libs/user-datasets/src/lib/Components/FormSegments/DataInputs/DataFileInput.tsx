import React, { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";
import { FieldLabel } from "../FieldLabel";
import { cx } from "../component-utils";
import { FileInput } from "@veupathdb/wdk-client/lib/Components";

interface Props {
  readonly maxFileSize: number;
  readonly allowedFileExtensions?: string[];
  readonly setFile: Dispatch<SetStateAction<File | undefined>>;
  readonly inputConstructor?: () => ReactNode;
}

export function DataFileInput(props: Props): ReactElement {
  return <>
    <FieldLabel htmlFor="data-set-file">Upload File</FieldLabel>
    <div id="data-set-file" className={cx("--UploadMethodField")}>
      {props.inputConstructor?.() ?? newDefaultFileInput(props)}
    </div>
  </>;
}

function newDefaultFileInput(props: Props): ReactElement {
  return <FileInput
    accept={props.allowedFileExtensions?.join(",") || undefined}
    maxSizeBytes={props.maxFileSize}
    onChange={file => props.setFile(
      (file && new File([ file ], file?.name.replace(/\s+/g, "_"), file))
      ?? undefined,
    )}
  />;
}
