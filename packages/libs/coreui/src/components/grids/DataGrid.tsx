import {
  useTable,
  useSortBy,
  HeaderGroup,
  usePagination,
  Cell,
  Row,
} from 'react-table';
import { pickBy } from 'lodash';

// Definitions
import { DARK_GRAY, LIGHT_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import typography from '../../styleDefinitions/typography';

// Components
import { H3 } from '../headers';

// Images
import CaretUpIcon from '../../assets/icons/CaretUp';
import CaretDownIcon from '../../assets/icons/CaretDown';
import DoubleArrow from '../../assets/icons/DoubleArrow';
import Arrow from '../../assets/icons/Arrow';
import { ReactNode } from 'react';

export type DataGridProps = {
  /** Column definitions. */
  columns: Array<{ Header: string; accessor: string }>;
  /** Data for rows. */
  data: Array<object>;
  /** Optional. Title for DataGrid */
  title?: string;
  /** Optional. Designates that the grid should be sortable. */
  sortable?: boolean;
  /** Optional. Controls pagination of grid. */
  pagination?: {
    recordsPerPage: number;
    controlsLocation: 'top' | 'bottom' | 'both';
  };
  /** Optional. Override default visual styles. */
  styleOverrides?: StyleOverridesSpec;
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

type StyleOverridesSpec = {
  /** Styles for header cells. */
  headerCells?: React.CSSProperties;
  /** Styles for data cells. */
  dataCells?: React.CSSProperties;
  /** Color directives for icons. */
  icons?: {
    inactiveColor: NonNullable<React.CSSProperties['color']>;
    activeColor: NonNullable<React.CSSProperties['color']>;
  };
};

export default function DataGrid({
  columns,
  data,
  title,
  sortable = false,
  pagination,
  styleOverrides,
  extraHeaderControls = [],
}: DataGridProps) {
  // Merge default styles with any style overrides provided by user.
  const mergedStylesDefinitions: Required<StyleOverridesSpec> = {
    headerCells: Object.assign(
      {
        border: 'none',
        paddingLeft: 10,
        paddingRight: 35,
        paddingBottom: 5,
        paddingTop: 5,
        color: DARK_GRAY,
        fontWeight: 600,
        display: 'flex',
        alignContent: 'center',
      },
      styleOverrides?.headerCells ?? {}
    ),
    dataCells: Object.assign(
      {
        padding: '10px',
        border: 'solid 2px',
        borderColor: MEDIUM_GRAY,
        color: DARK_GRAY,
      },
      styleOverrides?.dataCells ?? {}
    ),
    icons: Object.assign(
      {
        inactiveColor: MEDIUM_GRAY,
        activeColor: DARK_GRAY,
      },
      styleOverrides?.icons ?? {}
    ),
  };

  // Obtain data and data controls from react-table.
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
      initialState: {
        // @ts-ignore
        pageSize: pagination?.recordsPerPage ?? -1,
      },
    },
    useSortBy,
    usePagination
  );

  /** Pagination controls are rendered when requested by the user. */
  const renderPaginationControls = () => {
    const commonButtonCSS = {
      height: 25,
      width: 25,
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderRadius: 5,
      borderColor: MEDIUM_GRAY,
      borderWidth: 1,
    };

    return (
      <div css={{ marginTop: 10 }}>
        <div css={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
          <button
            css={{ marginRight: 5, ...commonButtonCSS }}
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            <DoubleArrow />
          </button>
          <button
            css={{ marginRight: 10, ...commonButtonCSS }}
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <Arrow
              extraCSS={{
                transform: 'rotate(-90deg)',
              }}
            />
          </button>
          <span
            css={[
              { marginRight: 10, textTransform: 'uppercase', color: DARK_GRAY },
              typography.pre,
            ]}
          >
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <button
            css={{ marginRight: 5, ...commonButtonCSS }}
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <Arrow
              extraCSS={{
                transform: 'rotate(90deg)',
              }}
            />
          </button>
          <button
            css={{ marginRight: 25, ...commonButtonCSS }}
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            <DoubleArrow extraCSS={{ transform: 'rotate(180deg)' }} />
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
            css={{
              height: 25,
              minHeight: 25,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderRadius: 5,
              borderColor: MEDIUM_GRAY,
              borderWidth: 1,
              paddingLeft: 5,
              color: DARK_GRAY,
            }}
          >
            {[1, 2, 3, 4, 5].map((pageSizeMultiplier) => (
              <option
                key={pagination!.recordsPerPage * pageSizeMultiplier}
                value={pagination!.recordsPerPage * pageSizeMultiplier}
              >
                Show {pagination!.recordsPerPage * pageSizeMultiplier}
              </option>
            ))}
          </select>
        </div>
        {/* <div>
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
        </div> */}
      </div>
    );
  };

  /** Sorting controls are added to each column when requested by the user.*/
  const renderSortingControls = (column: HeaderGroup<object>) =>
    sortable && (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginLeft: 10,
        }}
      >
        <CaretUpIcon
          color={
            // @ts-ignore
            column.isSorted && !column.isSortedDesc
              ? mergedStylesDefinitions.icons.activeColor
              : mergedStylesDefinitions.icons.inactiveColor
          }
        />
        <CaretDownIcon
          extraCSS={{ marginTop: 2 }}
          color={
            // @ts-ignore
            column.isSorted && column.isSortedDesc
              ? mergedStylesDefinitions.icons.activeColor
              : mergedStylesDefinitions.icons.inactiveColor
          }
        />
      </div>
    );

  /** Render an individual header cell. */
  const renderHeaderGroup = (headerGroup: HeaderGroup) => {
    const borderCSSOverrides = pickBy(
      mergedStylesDefinitions?.headerCells,
      (value, key) => key.includes('border')
    );

    const otherCSSOverrides = pickBy(
      mergedStylesDefinitions?.headerCells,
      (value, key) => !key.includes('border')
    );

    return (
      <th
        {...headerGroup.getHeaderProps()}
        // @ts-ignore
        {...(sortable && headerGroup.getSortByToggleProps())}
        css={{
          padding: 0,
          ...borderCSSOverrides,
        }}
      >
        <div
          css={[
            typography.p,
            otherCSSOverrides,
            { display: 'flex', alignItems: 'center' },
          ]}
        >
          {headerGroup.render('Header')}
          {renderSortingControls(headerGroup)}
          {extraHeaderControls.map((component) => component(headerGroup))}
        </div>
      </th>
    );
  };

  /** Render an individual data cell. */
  const renderDataCell = (cell: Cell) => {
    return (
      <td
        {...cell.getCellProps()}
        css={[
          typography.p,
          {
            ...mergedStylesDefinitions.dataCells,
          },
        ]}
      >
        {cell.render('Cell')}
      </td>
    );
  };

  return (
    <div>
      {title && <H3 text={title} additionalStyles={{ marginBottom: 20 }} />}
      {['top', 'both'].includes(pagination?.controlsLocation ?? '') &&
        renderPaginationControls()}
      <table
        {...getTableProps()}
        css={{ borderCollapse: 'collapse', marginBottom: 10 }}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              css={{
                textAlign: 'left',
                textTransform: 'capitalize',
                verticalAlign: 'bottom',
              }}
            >
              {headerGroup.headers.map((header) => renderHeaderGroup(header))}
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
                  backgroundColor: index % 2 === 0 ? 'white' : LIGHT_GRAY,
                }}
              >
                {row.cells.map((cell: Cell) => renderDataCell(cell))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {['bottom', 'both'].includes(pagination?.controlsLocation ?? '') &&
        renderPaginationControls()}
    </div>
  );
}
