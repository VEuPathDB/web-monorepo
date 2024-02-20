import React, { CSSProperties, ReactElement, ReactNode } from 'react';

type DefaultColumnKey<Row> = Extract<keyof Row, string>;

type ChildRowProps<Row> = {
  rowIndex: number;
  rowData: Row;
};

export interface MesaStateProps<
  Row,
  Key = DefaultColumnKey<Row>,
  Value = DefaultColumnValue<Row, Key>
> {
  rows: Row[];
  columns: MesaColumn<Row, Key, Value>[];
  filteredRows?: Row[];
  uiState?: {
    sort?: MesaSortObject;
    searchQuery?: string;
    filteredRowCount?: number;
    pagination?: {
      currentPage: number;
      totalPages?: number;
      totalRows: number;
      rowsPerPage: number;
      rowsPerPageOptions?: number[];
    };
    emptinessCulprit?: 'search' | 'nocolumns' | 'filters' | 'nodata';
    expandedRows?: number[];
  };
  headerWrapperStyle?: CSSProperties;
  options?: {
    title?: string;
    inline?: boolean;
    inlineMaxWidth?: string;
    inlineMaxHeight?: string;
    className?: string;
    showCount?: boolean;
    errOnOverflow?: boolean;
    editableColumns?: boolean;
    overflowHeight?: string;
    toolbar?: boolean;
    useStickyHeader?: boolean;
    useStickyFirstNColumns?: number;
    tableBodyMaxHeight?: string;
    selectedNoun?: string;
    selectedPluralNoun?: string;
    searchPlaceholder?: string;
    deriveRowClassName?: (row: Row) => string | undefined;
    renderEmptyState?: () => ReactNode;
    isRowSelected?: (row: Row) => boolean;
    childRow?:
      | string
      | ((props: ChildRowProps<Row>) => ReactElement<ChildRowProps<Row>>);
  };
  actions?: MesaAction<Row, Key>[];
  eventHandlers?: {
    onSearch?: (query: string) => void;
    onSort?: (
      column: MesaColumn<Row, Key>,
      direction: MesaSortObject['direction']
    ) => void;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (numRows: number) => void;
    onRowSelect?: (row: Row) => void;
    onRowDeselect?: (row: Row) => void;
    onMultipleRowSelect?: (rows: Row[]) => void;
    onMultipleRowDeselect?: (rows: Row[]) => void;
    onColumnReorder?: (columnKey: Key, columnIndex: number) => void;
    onExpandedRowsChange?: (indexes: number[]) => void;
  };
}

interface MesaAction<Row, Key = DefaultColumnKey<Row>> {
  selectionRequired?: boolean;
  element: React.ReactNode;
  callback?: (row: Row, columns: MesaColumn<Row, Key>[]) => void;
  handler?: (
    selection: Row[],
    columns: MesaColumn<Row, Key>[],
    rows: Row[]
  ) => void;
}

type DefaultColumnValue<Row, Key> = Key extends keyof Row ? Row[Key] : unknown;

interface CellProps<
  Row,
  Key = DefaultColumnKey<Row>,
  Value = DefaultColumnValue<Row, Key>
> {
  key: Key;
  value: Value;
  row: Row;
  column: MesaColumn<Row, Key>;
  rowIndex: number;
  columnIndex: number;
}

export interface MesaColumn<
  Row,
  Key = DefaultColumnKey<Row>,
  Value = DefaultColumnValue<Row, Key>
> {
  key: Key;
  name?: string;
  type?: string;
  primary?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  resizeable?: boolean;
  moveable?: boolean;
  helpText?: string;
  style?: CSSProperties;
  className?: string;
  width?: CSSProperties['width'];
  getValue?: (props: { row: Row; index: number }) => Value;
  renderCell?: (cellProps: CellProps<Row, Key, Value>) => ReactNode;
  renderHeading?:
    | boolean
    | ((
        column: MesaColumn<Row, Key>,
        columnIndex: number,
        components: {
          SortTrigger: ReactElement;
          HelpTrigger: ReactElement;
          ClickBoundary: ReactElement;
        }
      ) => ReactNode);
  wrapCustomHeadings?: (props: {
    column: MesaColumn<Row, Key, Value>;
    columnIndex: number;
    headerRowIndex: number;
  }) => boolean;
}

export interface MesaSortObject<Key extends string = string> {
  columnKey: Key;
  direction: 'asc' | 'desc';
}
