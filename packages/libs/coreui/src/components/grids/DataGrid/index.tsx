import { ReactNode, useEffect } from 'react';
import {
  useTable,
  useSortBy,
  HeaderGroup,
  usePagination,
  useRowSelect,
  Cell,
  Row,
  Hooks,
} from 'react-table';
import { pickBy, ceil } from 'lodash';

// Definitions
import stylePresets, { DataGridStyleSpec } from './stylePresets';

// Components
import { H3 } from '../../headers';
import IndeterminateCheckbox from './IndeterminateCheckbox';
import DataCell from './DataCell';
import HeaderCell from './HeaderCell';
import PaginationControls from './PaginationControls';

export type DataGridProps = {
  /**
   * Column definitions. The header attribute is displayed to the user.
   * The accessor attribute is used as a key to the column.
   */
  columns: Array<{ Header: string; accessor: string }>;
  /** Data for rows. */
  data: Array<object>;
  /** Optional. Indicates whether or not data is currently being loaded. */
  loading?: boolean;
  /** Optional. Title for DataGrid */
  title?: string;
  /** Optional. Designates that the grid should be sortable. */
  sortable?: boolean;
  /** Optional. Controls pagination of grid. */
  pagination?: {
    /** Number of records to display per page. */
    recordsPerPage: number;
    /** Location of pagination controls. */
    controlsLocation: 'top' | 'bottom' | 'both';
    /** Optional. Additional props for when you are controlling paging on the server. */
    serverSidePagination?: {
      /**
       * Function to update the data for the current page.
       * NOTE: To avoid infinite loops, define this function with
       * useCallback. Here is an example to help you get started. :) 
       * 
       * const fetchPaginatedData = useCallback(({ pageSize, pageIndex }) => {
            setIsLoading(true);
            setTimeout(() => {
              setGridData(fetchGridData({ pageSize, pageIndex }));
              setPageCount(20 / pageSize);
              setIsLoading(false);
            }, 1000);
          }, []);
       * */
      fetchPaginatedData: ({
        pageSize,
        pageIndex,
      }: {
        pageSize: number;
        pageIndex: number;
      }) => void;
      /** Total available pages of data. */
      pageCount: number;
    };
  };

  /** Presets for commonly used styles */
  stylePreset?: keyof typeof stylePresets;

  /** Optional. Override default visual styles. */
  styleOverrides?: Partial<DataGridStyleSpec>;
  /**
   * Optional (ADVANCED). An array of functions that take a
   * react-table HeaderGroup and return a component. This essentially
   * gives you the ability to add one or more extra controls that will
   * be rendered on the right hand side of any header cell.
   *
   * For a practical example, please see the relevant section in storybook.
   */
  extraHeaderControls?: Array<(headerGroup: HeaderGroup) => ReactNode>;
};

export default function DataGrid({
  columns,
  data,
  loading = false,
  title,
  sortable = false,
  pagination,
  stylePreset = 'default',
  styleOverrides = {},
  extraHeaderControls = [],
}: DataGridProps) {
  const baseStyle = stylePresets[stylePreset];
  const finalStyle = Object.assign({}, baseStyle, styleOverrides);

  // Obtain data and data controls from react-table.
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    selectedFlatRows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: pagination?.recordsPerPage ?? -1,
      },
      ...(pagination && pagination.serverSidePagination
        ? {
            manualPagination: true,
            pageCount: ceil(pagination.serverSidePagination.pageCount),
            // manualSortBy: true,
            autoResetSortBy: false,
          }
        : {}),
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  /**
   * Listen for changes in pagination and use the state to fetch
   * new data as long as another request isn't pending.
   *  */
  useEffect(() => {
    if (pagination?.serverSidePagination?.fetchPaginatedData && !loading) {
      pagination.serverSidePagination.fetchPaginatedData({
        pageIndex,
        pageSize,
      });
    }
  }, [pageIndex, pageSize]);

  return (
    <div>
      {title && <H3 text={title} additionalStyles={{ marginBottom: 20 }} />}
      {['top', 'both'].includes(pagination?.controlsLocation ?? '') && (
        <PaginationControls
          loading={loading}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          gotoPage={gotoPage}
          previousPage={previousPage}
          nextPage={nextPage}
          pageIndex={pageIndex}
          pageCount={pageCount}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageOptions={pageOptions}
          pagination={pagination}
        />
      )}
      <table
        {...getTableProps()}
        css={{
          borderCollapse: 'collapse',
          marginBottom: 10,
          ...pickBy(finalStyle.table, (value, key) => key.includes('border')),
        }}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((header) => (
                <HeaderCell
                  headerGroup={header}
                  styleSpec={finalStyle}
                  sortable={sortable}
                  extraHeaderControls={extraHeaderControls}
                />
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row: Row, index: number) => {
            prepareRow(row);

            return (
              <tr
                {...row.getRowProps()}
                css={{
                  backgroundColor:
                    index % 2 === 0
                      ? finalStyle.table.primaryRowColor
                      : finalStyle.table.secondaryRowColor,
                }}
              >
                {row.cells.map((cell: Cell) => (
                  <DataCell cell={cell} styleSpec={finalStyle} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {['bottom', 'both'].includes(pagination?.controlsLocation ?? '') && (
        <PaginationControls
          loading={loading}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          gotoPage={gotoPage}
          previousPage={previousPage}
          nextPage={nextPage}
          pageIndex={pageIndex}
          pageCount={pageCount}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageOptions={pageOptions}
          pagination={pagination}
        />
      )}
    </div>
  );
}

export * from './stylePresets';
