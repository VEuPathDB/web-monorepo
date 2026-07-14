import { MesaDataCellProps } from './List/UserDatasetList';
import React, { ReactNode } from 'react';
import { DatasetListEntry } from '../Service';

export function makeClassifier(...classNames: string[]) {
  return (substyle?: string) =>
    classNames
      .map((className) => `${className}${substyle ? '-' + substyle : ''}`)
      .join(' ');
}

export function normalizePercentage(value: number) {
  return Math.floor(value * 100) / 100;
}

export function textCell<K extends keyof DatasetListEntry>(
  prop: K,
  transform: (v: DatasetListEntry[K]) => ReactNode
) {
  return ({ row }: MesaDataCellProps) =>
    prop in row ? <span>{transform(row[prop])}</span> : null;
}
