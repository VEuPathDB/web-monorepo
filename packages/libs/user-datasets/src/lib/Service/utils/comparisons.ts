import { DatasetPostDetails, DatasetUploads } from '../Model';
import { UploadFormState } from '../../StoreModules';

export function formStateEquals(
  a: UploadFormState | null | undefined,
  b: UploadFormState | null | undefined,
) {
  return postDetailsEqual(a?.datasetDetails, b?.datasetDetails)
    && dumbObjectEquality(a?.formMetaState ?? {}, b?.formMetaState ?? {})
    && uploadsEqual(a?.fileUploads, b?.fileUploads);
}

function postDetailsEqual(
  a: DatasetPostDetails | null | undefined,
  b: DatasetPostDetails | null | undefined,
): boolean {
  if (!a && !b)
    return true;

  if ((!a && b) || (a && !b))
    return false;

  return dumbObjectEquality(a!, b!);
}

function uploadsEqual(
  a: DatasetUploads | null | undefined,
  b: DatasetUploads | null | undefined,
) {
  return a?.url === b?.url
    && a?.dataFiles === b?.dataFiles
    && a?.documentFiles === b?.documentFiles
    && a?.dataPropertiesFiles === b?.dataPropertiesFiles;
}

/**
 * checks that two json-compatible objects are equivalent without necessarily
 * being the same instance.
 */
function dumbObjectEquality(
  a: Record<string, any>,
  b: Record<string, any>,
): boolean {
  if (!a && !b)
    return true;

  if ((!a && b) || (a && !b))
    return false;

  const set: Record<string, boolean> = {};

  for (const key of Object.keys(a))
    set[key] = true;
  for (const key of Object.keys(b))
    set[key] = true;

  for (const key of Object.keys(set)) {
    const fieldType = typeof a[key];

    if (fieldType !== typeof b[key])
      return false;

    switch (fieldType) {
      case "object":
        if (Array.isArray(a[key]))
          return dumbArrayEquality(a[key] as any[], b[key] as any[])
        return dumbObjectEquality(a![key] as object, b![key] as object);

      case "boolean":
      case "number":
      case "string":
        if (a![key] !== b![key])
          return false;
        break;

      case "undefined":
        break;

      default:
        throw Error(`illegal state: dumbObjectEquality given object with non-json compatible field at key ${key}`);
    }
  }

  return true;
}

/**
 * checks that two json-compatible arrays are equivalent without necessarily
 * being the same instance.
 */
function dumbArrayEquality(
  a: any[],
  b: any[],
): boolean {
  if (a.length !== b.length)
    return false;

  for (let i = 0; i < a.length; i++) {
    const itemType = typeof a[i];

    if (itemType != typeof b[i])
      return false;

    switch (itemType) {
      case "object":
        if (Array.isArray(a[i]))
          return dumbArrayEquality(a[i], b[i]);
        return dumbObjectEquality(a[i] as object, b[i] as object);

      case "boolean":
      case "number":
      case "string":
        if (a[i] !== b[i])
          return false;
        break;

      case "undefined":
        break;

      default:
        throw Error(`illegal state: dumbArrayEquality given array with non-json compatible item at position ${i}`);
    }
  }

  return true;
}