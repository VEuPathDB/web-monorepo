import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';

export type DataTableColumnKey<R> = keyof R & string;

export interface DataTableSortObject<R, K extends DataTableColumnKey<R>>
  extends MesaSortObject {
  columnKey: K;
  direction: 'asc' | 'desc';
}

export interface DataTableColumn<R, K extends DataTableColumnKey<R>>
  extends MesaColumn<R, K> {
  makeSearchableString?: (value: R[K]) => string;
  makeOrder?: (row: R) => boolean | number | string;
}

export type DataTableColumns<R, C extends DataTableColumnKey<R>> = {
  [K in C]: DataTableColumn<R, K>;
};
