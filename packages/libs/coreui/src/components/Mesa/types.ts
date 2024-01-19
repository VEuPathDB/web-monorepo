import React, { CSSProperties, ReactElement, ReactNode } from 'react';

export interface MesaStateProps<Row, Key = keyof Row> {
  rows: Row[];
  columns: MesaColumn<Row, Key>[];
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
    emptinessCulprit?: 'search' | 'nocolumns' | 'filtrs' | 'nodata';
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
    deriveRowClassName?: (row: Row) => string | undefined; // a function
    renderEmptyState?: () => ReactNode; // a function
    isRowSelected?: (row: Row) => boolean; // a callback function
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
  };
}

interface MesaAction<Row, Key> {
  selectionRequired?: boolean;
  element: React.ReactNode;
  callback?: (row: Row, columns: MesaColumn<Row, Key>[]) => void;
  handler?: (
    seection: Row[],
    columns: MesaColumn<Row, Key>[],
    rows: Row[]
  ) => void;
}

interface CellProps<Row, Key> {
  key: Key;
  value: Key extends keyof Row ? Row[Key] : unknown;
  row: Row;
  column: MesaColumn<Row, Key>;
  rowIndex: number;
  columnIndex: number;
}

export interface MesaColumn<Row, Key = keyof Row> {
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
  // getValue?: (props: { row: Row, index: number }) => ReactElement;
  renderCell?: (cellProps: CellProps<Row, Key>) => ReactNode; // a function
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
      ) => ReactNode); // a function
  wrapCustomHeadings?: (props: {
    column: MesaColumn<Row, Key>;
    columnIndex: number;
    headerRowIndex: number;
  }) => boolean; // a function
}

export interface MesaSortObject<Key extends string = string> {
  columnKey: Key;
  direction: 'asc' | 'desc';
}
