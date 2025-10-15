import React from "react";
import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";

export const cx = makeClassNameHelper("UploadForm");

export type InputUpdater<T, V extends keyof T = keyof T> = (inputName: V, newValue: T[V]) => void;

// A little helper to simplify updating fields of the nested inputs
export function createNestedInputUpdater<T>(
  index: number,
  setNestedInputObject: React.Dispatch<React.SetStateAction<T[]>>,
  enforceExclusiveTrue: boolean = false,
): InputUpdater<T> {
  return function<V extends keyof T>(inputName: keyof T, newValue: T[V]) {
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
