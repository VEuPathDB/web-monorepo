import { DatasetTypeConfig } from './DatasetTypeConfig';
import { isEmpty } from 'lodash';

export interface DatasetTypeSelection {
  readonly name: string;
  readonly version: string;
}

export function isSameDataType(
  c1: DatasetTypeSelection,
  c2: DatasetTypeSelection
): boolean {
  return c1.name === c2.name && c1.version === c2.version;
}

export function stringifyDataType(type: DatasetTypeSelection): string {
  return `${type.name}:${type.version}`;
}

export function parseDataTypeString(type: string): DatasetTypeSelection {
  const parts = type.split(':');

  if (parts.length !== 2) {
    throw new Error(`invalid dataset type string: ${type}`);
  }

  return { name: parts[0], version: parts[1] };
}

export function findDatasetTypeConfig(
  type: DatasetTypeSelection,
  configs: readonly DatasetTypeConfig[]
): DatasetTypeConfig | null {
  const hits = configs.filter((dtc) => isSameDataType(type, dtc));

  if (isEmpty(hits)) return null;

  return hits[0];
}
