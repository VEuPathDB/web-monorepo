import { MesaDataCellProps } from "./List/UserDatasetList";
import { DatasetListEntry } from "../Utils/types";

export function makeClassifier(...classNames: string[]) {
  return (substyle?: string) =>
    classNames
      .map((className) => `${className}${substyle ? '-' + substyle : ''}`)
      .join(' ');
}

export const quotaSize = 10737418240; // 10 G

export function normalizePercentage(value: number) {
  return Math.floor(value * 100) / 100;
}

export function textCell(prop: keyof DatasetListEntry, transform: (v: any) => any) {
  const getValue =
    typeof transform === 'function' ? transform : (value: any) => value;
  return ({ row }: MesaDataCellProps) => (prop in row ? <span>{getValue(row[prop])}</span> : null);
}
