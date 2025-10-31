import React, { Dispatch, SetStateAction } from "react";
import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";

export const cx = makeClassNameHelper("UploadForm");

export type FormValidator = () => string[] | null;

export type ObjectUpdater<T, V extends keyof T = keyof T> = (inputName: V, newValue: T[V]) => void;
export type ArrayUpdater<T> = (newValue: T) => void;

export type InputConstructor<T> = (record: T, index: number) => React.ReactElement;

export type RecordUpdater<R> = Dispatch<SetStateAction<R[]>>;

export interface RecordListProps<T> {
  readonly records?: T[],
  readonly setRecords: (values: T[]) => void,
}

export type ArrayElement<T> = T extends Array<infer E> ? E : never;

// A little helper to simplify updating fields of the nested inputs
export function newListPropUpdater<T>(
  index: number,
  setNestedInputObject: RecordUpdater<T>,
  enforceExclusiveTrue: boolean = false,
): ObjectUpdater<T> {
  return function<K extends keyof T, V = ArrayElement<T[K]>>(inputName: K, newValue: V) {
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

// A little helper to simplify updating fields of the nested inputs
export function newArrayInputUpdater<T>(index: number, setNestedInputObject: RecordUpdater<T>): ArrayUpdater<T> {
  return newValue => setNestedInputObject(prev => {
    const updated = [ ...prev ];
    updated[index] = newValue;
    return updated;
  });
}
