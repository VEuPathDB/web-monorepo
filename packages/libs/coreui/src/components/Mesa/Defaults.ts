interface ColumnDefaultsType {
  primary: boolean;
  searchable: boolean;
  sortable: boolean;
  resizeable: boolean;
  truncated: boolean;
  filterable: boolean;
  filterState: {
    enabled: boolean;
    visible: boolean;
    blacklist: any[];
  };
  hideable: boolean;
  hidden: boolean;
  disabled: boolean;
  type: string;
}

interface OptionsDefaultsType {
  title: string | null;
  toolbar: boolean;
  inline: boolean;
  className: string | null;
  showCount: boolean;
  errOnOverflow: boolean;
  editableColumns: boolean;
  overflowHeight: string;
  searchPlaceholder: string;
  isRowSelected: <Row>(row: Row, index: number) => boolean;
}

interface UiStateDefaultsType {
  searchQuery: string | null;
  filteredRowCount: number;
  sort: {
    columnKey: string | null;
    direction: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    totalPages: number | null;
    totalRows: number | null;
    rowsPerPage: number;
  };
}

export const ColumnDefaults: ColumnDefaultsType = {
  primary: false,
  searchable: true,
  sortable: true,
  resizeable: true,
  truncated: false,

  filterable: false,
  filterState: {
    enabled: false,
    visible: false,
    blacklist: [],
  },

  hideable: true,
  hidden: false,

  disabled: false,
  type: 'text',
};

export const OptionsDefaults: OptionsDefaultsType = {
  title: null,
  toolbar: true,
  inline: false,
  className: null,
  showCount: true,
  errOnOverflow: false,
  editableColumns: true,
  overflowHeight: '16em',
  searchPlaceholder: 'Search This Table',
  isRowSelected: <Row>(row: Row, index: number): boolean => {
    return false;
  },
};

export const UiStateDefaults: UiStateDefaultsType = {
  searchQuery: null,
  filteredRowCount: 0,
  sort: {
    columnKey: null,
    direction: 'asc',
  },
  pagination: {
    currentPage: 1,
    totalPages: null,
    totalRows: null,
    rowsPerPage: 20,
  },
};
