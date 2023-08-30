import { ReactNode, useEffect, useMemo } from 'react';
import {
  useTable,
  useSortBy,
  HeaderGroup,
  usePagination,
  useRowSelect,
  Cell,
  Row,
  Column,
} from 'react-table';
import { ceil, merge } from 'lodash';

// Definitions
import stylePresets, { DataGridStyleSpec } from './stylePresets';

// Components
import { H3 } from '../../typography';
import IndeterminateCheckbox from '../../inputs/checkboxes/IndeterminateCheckbox';
import DataCell from './DataCell';
import HeaderCell from './HeaderCell';
import PaginationControls from './PaginationControls';
import { UITheme } from '../../theming/types';

export type SortBy = Array<{ id: string; desc: boolean }>;

export type DataGridProps = {
  /**
   * Column definitions. The header attribute is displayed to the user.
   * The accessor attribute is used as a key to the column. See react-table
   * docs for more available attributes: https://react-table-v7.tanstack.com/
   */
  columns: Array<Column>;
  /** Data for rows. */
  data: Array<object>;
  /** Optional. Which theme role should be used to augment the style of the component. */
  themeRole?: keyof UITheme['palette'];
  /** Optional. Indicates whether or not data is currently being loaded. */
  loading?: boolean;
  /** Optional. Title for DataGrid */
  title?: string;
  /** Optional. Designates that the grid should be sortable. */
  sortable?: boolean;
  /**
   * Optional. What to do if row(s) are selected. If this prop is defined,
   * it will be taken as an indication that allowing row selection is desired.
   * */
  onRowSelection?: (rows: Row<object>[]) => void;
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
        sortBy,
      }: {
        pageSize: number;
        pageIndex: number;
        sortBy?: SortBy;
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
  themeRole,
  loading = false,
  title,
  sortable = false,
  onRowSelection = undefined,
  pagination,
  stylePreset = 'default',
  styleOverrides = {},
  extraHeaderControls = [],
}: DataGridProps) {
  const baseStyle = stylePresets[stylePreset];
  const finalStyle = useMemo(
    () => merge({}, baseStyle, styleOverrides),
    [baseStyle, styleOverrides]
  );

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
    state: { pageIndex, pageSize, sortBy },
    rows,
    toggleRowSelected,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        /**
         * If pagination spec exists, use that to determine the number
         * of records to be displayed at one time. Otherwise, display
         * all records in data.
         * */
        pageSize: pagination?.recordsPerPage ?? data.length,
      },
      // If pagination is desired, add necessary parameters.
      ...(pagination && pagination.serverSidePagination
        ? {
            manualPagination: true,
            manualSortBy: true,
            pageCount: ceil(pagination.serverSidePagination.pageCount),
            autoResetSortBy: false,
          }
        : {}),
    },
    useSortBy,
    usePagination,

    // Row Selection Add-Ons
    useRowSelect,
    (hooks) => {
      /**
       * Add an additional pseudo cell for each row that will allow the
       * user to select the row in the UI.
       */
      if (onRowSelection) {
        hooks.visibleColumns.push((columns) => [
          // Let's make a column for selection
          {
            id: 'selection',
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllPageRowsSelectedProps }: any) => {
              const props = getToggleAllPageRowsSelectedProps();
              return (
                <div>
                  <IndeterminateCheckbox
                    checked={props.checked ?? false}
                    indeterminate={props.indeterminate ?? false}
                    onChange={props.onChange}
                    value={''}
                    name={''}
                    // themeRole={themeRole}
                  />
                </div>
              );
            },
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox.
            // The `checked` prop returned by getToggleRowSelectedProps is not fit for purpose
            // because it only considers initial pre-selected/checked state (originalData[].isSelected).
            // Luckily `row.isSelected` has the correct "live" state.
            Cell: ({ row }: any) => {
              const props = row.getToggleRowSelectedProps();
              return (
                <div>
                  <IndeterminateCheckbox
                    checked={row.isSelected}
                    indeterminate={props.indeterminate ?? false}
                    onChange={props.onChange}
                    name={''}
                    value={row.id}
                    // themeRole={themeRole}
                  />
                </div>
              );
            },
          },
          ...columns,
        ]);
      }
    }
  );

  // react-table's sortBy allows undefined column.desc, but it doesn't explain
  // when that would be the case and I couldn't force an example. Filter out
  // undefined values to conform with our better-defined SortBy type
  const filteredSortBy = useMemo(
    () => sortBy.filter((column) => column.desc !== undefined),
    [sortBy]
  ) as SortBy;

  /**
   * Listen for changes in pagination and fetch
   * new data as long as another request isn't pending.
   *  */
  useEffect(() => {
    if (pagination?.serverSidePagination?.fetchPaginatedData && !loading) {
      pagination.serverSidePagination.fetchPaginatedData({
        pageIndex,
        pageSize,
        sortBy: filteredSortBy,
      });
    }
  }, [pageIndex, pageSize, filteredSortBy]);

  // Listen for changes to row selection, if applicable.
  useEffect(() => {
    onRowSelection && onRowSelection(selectedFlatRows);
  }, [selectedFlatRows]);

  // Fix from https://github.com/TanStack/react-table/issues/2459#issuecomment-851523333
  // to properly set selected state from incoming `isSelected` prop in data
  useEffect(() => {
    rows.forEach(
      ({
        id,
        original,
      }: {
        id: string;
        original: { isSelected?: boolean };
      }) => {
        if (original.isSelected != null) {
          toggleRowSelected(id, original.isSelected);
        }
      }
    );
  }, [rows, toggleRowSelected]);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: finalStyle.size?.height,
        width: finalStyle.size?.width,
      }}
    >
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
          styleOverrides={finalStyle.paginationControls?.top}
        />
      )}
      <div
        css={{
          height: '100%',
          overflow: finalStyle.table.overflow,
        }}
      >
        <table
          {...getTableProps()}
          css={{
            borderCollapse: 'collapse',
            borderWidth: finalStyle.table.borderWidth,
            borderStyle: finalStyle.table.borderStyle,
            borderColor: finalStyle.table.borderColor,
            width: finalStyle.table.width,
            height: finalStyle.table.height,
          }}
        >
          {/* Render Table Header */}
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <HeaderCell
                    key={index}
                    headerGroup={header}
                    styleSpec={finalStyle}
                    sortable={sortable && header.canSort}
                    extraHeaderControls={extraHeaderControls}
                  />
                ))}
              </tr>
            ))}
          </thead>

          {/* Render Table Body */}
          <tbody {...getTableBodyProps()}>
            {page.map((row: Row, index: number) => {
              prepareRow(row);

              return (
                <tr
                  {...row.getRowProps()}
                  key={row.id}
                  css={{
                    backgroundColor:
                      index % 2 === 0
                        ? finalStyle.table.primaryRowColor
                        : finalStyle.table.secondaryRowColor,
                  }}
                >
                  {row.cells.map((cell: Cell, index) => (
                    <DataCell key={index} cell={cell} styleSpec={finalStyle} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
          styleOverrides={finalStyle.paginationControls?.bottom}
        />
      )}
    </div>
  );
}

export * from './stylePresets';
