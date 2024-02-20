import React, { useCallback } from 'react';
import { ArrowDown, ArrowRight } from '../../icons';

type Props = {
  rowIndex: number;
  rows: unknown[];
  onExpandedRowsChange: (indexes: number[]) => void;
  expandedRows: number[];
  inert: boolean;
  heading: boolean;
};

export default function ExpansionCell({
  rowIndex,
  rows,
  onExpandedRowsChange,
  expandedRows,
  inert,
  heading,
}: Props) {
  const expandAllRows = useCallback(
    () => onExpandedRowsChange(rows.map((row, index) => index)),
    [onExpandedRowsChange, rows]
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
      <th className="wdk-DataTableCell wdk-DataTableCell__childRowToggle">
        {inert ? null : areAllRowsExpanded ? (
          <button
            className="wdk-DataTableCellExpand"
            title={title}
            onClick={handler}
          >
            <ArrowDown />
          </button>
        ) : (
          <button
            className="wdk-DataTableCellExpand"
            title={title}
            onClick={handler}
          >
            <ArrowRight />
          </button>
        )}
      </th>
    );
  }, [rows, expandedRows, collapseAllRows, expandAllRows, inert]);

  const renderRowExpansionToggle = useCallback(() => {
    const isExpanded = expandedRows.includes(rowIndex);

    const handler = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isExpanded) {
        // remove from expandedRows
        onExpandedRowsChange(expandedRows.filter((row) => row != rowIndex));
      } else {
        // expand and add to expandedRows
        onExpandedRowsChange(expandedRows.concat(rowIndex));
      }
    };

    return (
      <td className="wdk-DataTableCellExpand">
        {inert ? null : isExpanded ? (
          <button className="wdk-DataTableCellExpand" onClick={handler}>
            <ArrowDown />
          </button>
        ) : (
          <button className="wdk-DataTableCellExpand" onClick={handler}>
            <ArrowRight />
          </button>
        )}
      </td>
    );
  }, [expandedRows, rowIndex, onExpandedRowsChange, inert]);

  return heading ? renderPageExpansionToggle() : renderRowExpansionToggle();
}
