import React from 'react';
import { MesaStateProps } from '../types';

interface RowCounterProps<Row extends Record<PropertyKey, any>, Key = string>
  extends Pick<MesaStateProps<Row, Key>, 'uiState' | 'eventHandlers'> {
  rows: Row[];
}

class RowCounter<
  Row extends Record<PropertyKey, any>,
  Key = string
> extends React.PureComponent<RowCounterProps<Row, Key>> {
  render() {
    const { rows, uiState, eventHandlers } = this.props;

    const { pagination, filteredRowCount = 0 } = uiState ?? {};
    const { totalRows, rowsPerPage, currentPage } = pagination ?? {};

    const isPaginated = eventHandlers && 'onPageChange' in eventHandlers;
    const isSearching = uiState?.searchQuery && uiState.searchQuery.length;

    const count = totalRows ? totalRows : rows.length;

    const noun =
      (isSearching ? 'result' : 'row') +
      (count - filteredRowCount === 1 ? '' : 's');

    const start =
      !isPaginated || !currentPage || !rowsPerPage
        ? null
        : (currentPage - 1) * rowsPerPage + 1;

    const end =
      !isPaginated || !start || !rowsPerPage
        ? null
        : start + rowsPerPage > count - filteredRowCount
        ? count - filteredRowCount
        : start - 1 + rowsPerPage;

    let filterString = !filteredRowCount ? null : (
      <span className="faded">
        {' '}
        (filtered from a total of {count.toLocaleString()})
      </span>
    );
    const remainingRowCount = !filteredRowCount
      ? count
      : count - filteredRowCount;

    let countString = (
      <span>
        <b>{remainingRowCount.toLocaleString()}</b> {noun}
      </span>
    );
    let allResultsShown =
      !start || !end || (start === 1 && end === remainingRowCount);

    if (!allResultsShown) {
      countString = (
        <span>
          {noun} <b>{start}</b> - <b>{end}</b> of <b>{remainingRowCount}</b>
        </span>
      );
    }

    return (
      <div className="RowCounter">
        {countString}
        {filterString}
      </div>
    );
  }
}

export default RowCounter;
