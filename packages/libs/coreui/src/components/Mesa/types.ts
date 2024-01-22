import React, { CSSProperties } from 'react';

export interface MesaStateProps<Row, Key extends string> {
  rows: Row[];
  columns: MesaColumn<Key>[];
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
    deriveRowClassName?: unknown; // a function
    renderEmptyState?: unknown; // a function
    isRowSelected?: unknown; // a callback function
  };
  actions?: MesaAction[];
  eventHandlers?: {
    onSearch?: unknown;
    onSort?: unknown;
    onSortChange?: unknown;
    onPageChange?: unknown;
    onRowsPerPageChange?: unknown;
    onRowSelect?: unknown;
    onRowDeselect?: unknown;
    onMultipleRowSelect?: unknown;
    onMultipleRowDeselect?: unknown;
    onColumnReorder?: unknown;
  };
}

interface MesaAction {
  selectionRequired?: boolean;
  element: React.ReactNode;
  callback?: unknown;
  handler?: unknown;
}

export interface MesaColumn<Key extends string = string> {
  key: Key;
  name?: string;
  type?: string;
  primary?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  resizeable?: boolean;
  moveable?: boolean;
  helpText?: string;
  style?: any;
  className?: string;
  width?: any;
  renderCell?: unknown; // a function
  renderHeading?: unknown; // a function
  wrapCustomHeadings?: unknown; // a function
}

export interface MesaSortObject<Key extends string = string> {
  columnKey: Key;
  direction: 'asc' | 'desc';
}
