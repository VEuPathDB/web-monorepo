import { MesaColumn, MesaSortObject } from '@veupathdb/wdk-client/lib/Core/CommonTypes';

export type DataTableColumnKey<R> = keyof R & string;

export interface DataTableSortObject<R, K extends DataTableColumnKey<R>> extends MesaSortObject {
  columnKey: K;
  direction: 'asc' | 'desc';
};

export interface DataTableColumn<R, K extends DataTableColumnKey<R>> extends MesaColumn<K> {
  renderCell?: (props: { row: R, value: R[K] }) => React.ReactNode;
  makeSearchableString?: (value: R[K]) => string;
  makeOrder?: (row: R) => boolean | number | string;
}

export type DataTableColumns<R, C extends DataTableColumnKey<R>> = {
  [K in C]: DataTableColumn<R, K>
};
