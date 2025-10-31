import { ReactNode } from "react";
import { DataUploadType } from "../FormTypes";

export function toDataUploadType(value: any): DataUploadType {
  switch (value) {
    case DataUploadType.SingleFile:
    case DataUploadType.URL:
    case DataUploadType.Result:
    case DataUploadType.MultiFile:
      return value as DataUploadType;
  }

  throw new Error(`Unrecognized upload method '${value}' encountered.`);
}

export interface UploadMethodItem {
  readonly value: DataUploadType;
  readonly display: NonNullable<ReactNode>;
}
