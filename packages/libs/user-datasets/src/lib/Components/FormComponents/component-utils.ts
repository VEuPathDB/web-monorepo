import React from "react";
import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";

export const cx = makeClassNameHelper("UploadForm");

// A little helper to simplify updating fields of the nested inputs
export function createNestedInputUpdater<T>(props: {
  index: number;
  setNestedInputObject: React.Dispatch<React.SetStateAction<T[]>>;
  enforceExclusiveTrue?: boolean;
}): (newValue: string | boolean, inputName: keyof T) => void {
  const { index, setNestedInputObject, enforceExclusiveTrue } = props;

  return function (newValue: string | boolean, inputName: keyof T) {
    setNestedInputObject((prev) => {
      const updated = [ ...prev ];

      if (enforceExclusiveTrue && newValue === true) {
        updated.forEach((item, i) => {
          if (i !== index) {
            updated[i] = { ...item, [inputName]: false };
          }
        });
      }

      updated[index] = { ...updated[index], [inputName]: newValue };
      return updated;
    });
  };
}
