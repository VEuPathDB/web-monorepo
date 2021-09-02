import { useTable, useSortBy, HeaderGroup, usePagination } from 'react-table';
import { DARK_GRAY, LIGHT_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import typography from '../../styleDefinitions/typography';
import { H3 } from '../headers';

import upArrow from './up_indicator.png';
import downArrow from './down_indicator.png';

export type DataGridProps = {
  columns: Array<{ Header: string; accessor: string }>;
  data: Array<object>;
  title?: string;
  sortable?: boolean;
  pagination?: {
    recordsPerPage: number;
  };
};

export default function DataGrid({
  columns,
  data,
  title,
  sortable = false,
  pagination,
}: DataGridProps) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    // @ts-ignore
    page,
    // @ts-ignore
    canPreviousPage,
    // @ts-ignore
    canNextPage,
    // @ts-ignore
    pageOptions,
    // @ts-ignore
    pageCount,
    // @ts-ignore
    gotoPage,
    // @ts-ignore
    nextPage,
    // @ts-ignore
    previousPage,
    // @ts-ignore
    setPageSize,
    // @ts-ignore
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      // @ts-ignore
      initialState: {
        ...(pagination ? { pageSize: pagination.recordsPerPage } : {}),
      },
    },
    useSortBy,
    usePagination
  );

  //   console.log(headerGroups);

  const renderPaginationControls = () =>
    pagination && (
      <div css={{ marginTop: 10 }}>
        <div css={{ marginBottom: 10 }}>
          <button
            css={{ marginRight: 5 }}
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            {'<<'}
          </button>
          <button
            css={{ marginRight: 10 }}
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {'<'}
          </button>
          <span
            css={[
              { marginRight: 10, textTransform: 'uppercase' },
              typography.pre,
            ]}
          >
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <button
            css={{ marginRight: 5 }}
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {'>'}
          </button>
          <button
            css={{ marginRight: 25 }}
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {'>>'}
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span
            css={[
              { marginRight: 5, textTransform: 'uppercase' },
              typography.pre,
            ]}
          >
            Go to page:
          </span>
          <input
            type='number'
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </div>
      </div>
    );

  const renderSortingControls = (column: HeaderGroup<object>) =>
    sortable && (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 10,
        }}
      >
        <img
          css={{
            height: 8,
            width: 16,
            // @ts-ignore
            opacity: column.isSorted && !column.isSortedDesc ? 0.5 : 0.3,
            marginBottom: 1,
          }}
          src={upArrow}
        />
        <img
          css={{
            height: 8,
            width: 16,
            // @ts-ignore
            opacity: column.isSortedDesc ? 0.5 : 0.3,
          }}
          src={downArrow}
        />
      </div>
    );

  return (
    <div>
      {title && <H3 text={title} additionalStyles={{ marginBottom: 20 }} />}
      <table {...getTableProps()} css={{ borderCollapse: 'collapse' }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                return (
                  <th
                    {...column.getHeaderProps()}
                    // @ts-ignore
                    {...(sortable && column.getSortByToggleProps())}
                  >
                    <div
                      css={[
                        typography.p,
                        {
                          paddingRight: 35,
                          paddingBottom: 5,
                          color: DARK_GRAY,
                          fontWeight: 600,
                          display: 'flex',
                          alignContent: 'center',
                        },
                      ]}
                    >
                      {column.render('Header')}
                      {renderSortingControls(column)}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row, index) => {
            prepareRow(row);

            return (
              <tr
                {...row.getRowProps()}
                css={{
                  backgroundColor: index % 2 === 0 ? 'white' : LIGHT_GRAY,
                }}
              >
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      css={[
                        {
                          padding: '10px',
                          border: 'solid 2px',
                          borderColor: MEDIUM_GRAY,
                          color: DARK_GRAY,
                        },
                        typography.p,
                      ]}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {renderPaginationControls()}
    </div>
  );
}
