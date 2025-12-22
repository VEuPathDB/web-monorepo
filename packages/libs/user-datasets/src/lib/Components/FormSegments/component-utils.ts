import React, { Dispatch, SetStateAction } from "react";
import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";

export const cx = makeClassNameHelper("UploadForm");

export type FormValidator = () => string[] | null;

type Scalar = string | number | boolean | bigint | null;

export declare function updateObject<T>(
  newValues: { [V in keyof T]: (T[V] & Scalar) | undefined }
): void;
export declare function updateObject<T, V extends keyof T = keyof T>(
  key: V,
  newValue: (T[V] & Scalar) | undefined
): void;
export declare function updateObject<T, V extends keyof T = keyof T>(
  multi: V | { [V in keyof T]: (T[V] & Scalar) | undefined }, newValue?: Scalar): void;

export type ObjectUpdater<T, V extends keyof T = keyof T> = typeof updateObject<T, V>;

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
): ObjectUpdater<T> {
  return function<K extends keyof T, V = ArrayElement<T[K]>>(multi: K | { [V in keyof T]: T[V] }, newValue?: V) {
    setNestedInputObject((prev: T[]) => {
      const updated = [ ...prev ];

      updated[index] = typeof multi === "object"
        ? { ...updated[index], ...multi }
        : { ...updated[index], [multi]: newValue }

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
