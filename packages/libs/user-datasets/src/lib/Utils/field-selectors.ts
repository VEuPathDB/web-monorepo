import { Consumer, transform } from "./utils";
import { FieldSetter } from "./util-types";
import { FormEvent, useCallback, useState } from "react";
import { DatasetPostRequest } from "../Service/Types";
import { projectId } from "@veupathdb/web-common/lib/config";
import { DataUpload, MetaFileUpload } from "../Components/FormTypes";
import { ArrayElement } from "../Components/FormSegments/component-utils";

export const rootFieldSelector = function <T, K extends keyof T>(
  key: K,
  obj: T,
  setter: FieldSetter<T>,
): [ T[K], Consumer<T[K]> ] {
  return [
    obj[key],
    val => setter(prev => ({ ...prev, [key]: val }))
  ]
};

export const rootValueSelector = function<T, K extends keyof T>(
  key: K,
  obj: T,
  setter: FieldSetter<T>,
): { value: T[K], onChange: Consumer<T[K]> } {
  return transform(
    rootFieldSelector(key, obj, setter),
    ([ value, onChange ]) => ({ value, onChange}),
  );
}

export interface ListSectionProps<T> {
  readonly records: T[];
  readonly setRecords: FieldSetter<T[]>;
}

export function createRootListSectionProps<
  T extends object,
  K extends keyof T,
  V extends ArrayElement<T[K]>,
>(
  key: K,
  obj: T,
  setter: FieldSetter<T>,
): ListSectionProps<V> {
  return {
    records: (obj[key] as V[]) ?? [],
    setRecords: values => setter({ ...obj, [key]: values }),
  };
}

export function createSubListSectionProps<
  T extends object,
  K extends keyof T,
  R extends T[K] & object,
  S extends keyof R,
  V extends ArrayElement<R[S]>,
>(
  root: K,
  subKey: S,
  obj: T,
  setter: FieldSetter<T>,
): ListSectionProps<V> {
  const rootObject = (obj[root] ?? {}) as R;

  return {
    records: (rootObject[subKey] as V[]) ?? [],
    setRecords: values => setter({
      ...obj,
      [root]: {
        ...rootObject,
        [subKey]: values,
      },
    }),
  };
}
