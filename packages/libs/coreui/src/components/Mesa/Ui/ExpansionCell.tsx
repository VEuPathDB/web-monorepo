import React, { useCallback } from 'react';
import { ArrowDown, ArrowRight } from '../../icons';

type Props = {
  rows: unknown[];
  row: unknown;
  onExpandedRowsChange: (ids: (string | number)[]) => void;
  expandedRows: (string | number)[];
  getRowId: (row: unknown) => string | number;
  inert: boolean;
  heading: boolean;
};

const EMPTY_ARRAY: Props['expandedRows'] = [];

export default function ExpansionCell({
  rows,
  row,
  onExpandedRowsChange,
  expandedRows = EMPTY_ARRAY,
  getRowId,
  inert,
  heading,
}: Props) {
  const expandAllRows = useCallback(
    () => onExpandedRowsChange(rows.map((row) => getRowId(row))),
    [onExpandedRowsChange, rows, getRowId]
  );

  const collapseAllRows = useCallback(
    () => onExpandedRowsChange([]),
    [onExpandedRowsChange]
  );

  const renderPageExpansionToggle = useCallback(() => {
    const areAllRowsExpanded = rows.length === expandedRows.length;

    const handler = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      e.preventDefault();
      return areAllRowsExpanded ? collapseAllRows() : expandAllRows();
    };

    const title = 'Show or hide all row details';

    return (
      <th className="HeadingCell ChildRowToggle">
        {inert ? null : areAllRowsExpanded ? (
          <button title={title} onClick={handler}>
            <ArrowDown />
          </button>
        ) : (
          <button title={title} onClick={handler}>
            <ArrowRight />
          </button>
        )}
      </th>
    );
  }, [rows, expandedRows, collapseAllRows, expandAllRows, inert]);

  const renderRowExpansionToggle = useCallback(() => {
    const isExpanded = expandedRows.includes(getRowId(row));

    const handler = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isExpanded) {
        // remove from expandedRows
        onExpandedRowsChange(
          expandedRows.filter((rowId) => rowId != getRowId(row))
        );
      } else {
        // expand and add to expandedRows
        onExpandedRowsChange(expandedRows.concat(getRowId(row)));
      }
    };

    return (
      <td className="ChildRowToggle">
        {inert ? null : isExpanded ? (
          <button onClick={handler}>
            <ArrowDown />
          </button>
        ) : (
          <button onClick={handler}>
            <ArrowRight />
          </button>
        )}
      </td>
    );
  }, [expandedRows, row, getRowId, onExpandedRowsChange, inert]);

  return heading ? renderPageExpansionToggle() : renderRowExpansionToggle();
}
