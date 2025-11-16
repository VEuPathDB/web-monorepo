import React, { CSSProperties, ReactElement, ReactNode } from 'react';

type DefaultColumnKey<Row> = Extract<keyof Row, string>;

export type ChildRowProps<Row> = {
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
    sort?: MesaSortObject<Key extends string ? Key : string>;
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
    expandedRows?: (number | string)[];
    groupBySelected?: boolean;
    columnOrder?: string[];
  };
  headerWrapperStyle?: CSSProperties;
  options?: {
    title?: string;
    inline?: boolean;
    inlineMaxWidth?: string;
    inlineMaxHeight?: string;
    inlineUseTooltips?: boolean; // don't use onClick to show the full contents, use an onMouseOver tooltip instead
    className?: string;
    style?: React.CSSProperties;
    errOnOverflow?: boolean;
    editableColumns?: boolean;
    overflowHeight?: string;
    toolbar?: boolean;
    columnDefaults?: Partial<MesaColumn<Row, Key>>;
    /**
     * It's possible to render counts in the ActionToolbar and the Toolbar, so be careful not to duplicate.
     * This is because we pass search filters as children to Mesa that renders in the Toolbar if the toolbar
     * option is true and renders in the ActionToolbar when false. For CSS positioning reasons, it's cleaner
     * to render either toolbar component and not both, thus why it's possible to render counts in either situation.
     */
    showCount?: boolean;
    useStickyHeader?: boolean;
    useStickyFirstNColumns?: number;
    tableBodyMaxHeight?: string;
    selectColumnHeadingDetails?: {
      heading: string;
      helpText?: string;
    };
    selectedNoun?: string;
    selectedPluralNoun?: string;
    searchPlaceholder?: string;
    deriveRowClassName?: (row: Row) => string | undefined;
    renderEmptyState?: () => ReactNode;
    isRowSelected?: (row: Row) => boolean;
    /**
     * To handle errors gracefully, childRow elements should be wrapped in wdk-client's ErrorBoundary.
     * As a reference, refer to the RecordTable.jsx component in wdk-client.
     */
    childRow?: (props: ChildRowProps<Row>) => ReactElement<ChildRowProps<Row>>;
    getRowId?: (row: Row) => string | number;
    /**
     * Renders the node in the left margin of the table.
     * This can be useful for rendering a graphic that
     * aligns with table rows, etc.
     */
    marginContent?: React.ReactNode;
    onRowClick?: (row: Row, rowIndex: number) => void;
    onRowMouseOver?: (row: Row, rowIndex: number) => void;
    onRowMouseOut?: (row: Row, rowIndex: number) => void;
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
    onExpandedRowsChange?: (ids: (string | number)[]) => void;
    onGroupBySelectedChange?: (groupBySelected: boolean) => void;
  };
}

export interface MesaAction<Row, Key = DefaultColumnKey<Row>> {
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

export interface CellProps<
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
  htmlHelp?: string;
  style?: CSSProperties;
  headingStyle?: CSSProperties;
  className?: string;
  width?: CSSProperties['width'];
  hidden?: boolean;
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
