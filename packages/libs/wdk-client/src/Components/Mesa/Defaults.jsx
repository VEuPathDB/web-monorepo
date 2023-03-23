import React from 'react';

import Icon from '../../Components/Mesa/Components/Icon';

export const ColumnDefaults = {
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

export const OptionsDefaults = {
  title: null,
  toolbar: true,
  inline: false,
  className: null,
  showCount: true,
  errOnOverflow: false,
  editableColumns: true,
  overflowHeight: '16em',
  searchPlaceholder: 'Search This Table',
  isRowSelected: (row, index) => {
    return false;
  },
};

export const UiStateDefaults = {
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
