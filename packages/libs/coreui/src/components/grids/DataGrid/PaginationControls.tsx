import { DataGridProps } from '.';
import Arrow from '../../../assets/icons/Arrow';
import DoubleArrow from '../../../assets/icons/DoubleArrow';
import { gray } from '../../../definitions/colors';
import typography from '../../../styleDefinitions/typography';

type PaginationControlsType = {
  loading: boolean;
  canPreviousPage: boolean;
  canNextPage: boolean;
  gotoPage: (pageNumber: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageOptions: Array<number>;
  pagination: DataGridProps['pagination'];
};

/** Pagination controls are rendered when requested by the user. */
export default function PaginationControls({
  loading,
  canPreviousPage,
  canNextPage,
  gotoPage,
  previousPage,
  nextPage,
  pageIndex,
  pageCount,
  pageSize,
  setPageSize,
  pageOptions,
  pagination,
}: PaginationControlsType) {
  const commonButtonCSS = {
    height: 25,
    width: 25,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: gray[400],
    borderWidth: 1,
  };

  return (
    <div
      css={[
        { marginTop: 10 },
        loading && { opacity: 0.5, pointerEvents: 'none' },
      ]}
    >
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
            { marginRight: 10, textTransform: 'uppercase', color: gray[500] },
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
            borderColor: gray[400],
            borderWidth: 1,
            paddingLeft: 5,
            color: gray[500],
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
}
