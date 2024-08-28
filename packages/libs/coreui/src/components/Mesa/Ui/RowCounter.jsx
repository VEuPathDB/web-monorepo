import React from 'react';

class RowCounter extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { rows, uiState, eventHandlers } = this.props;

    const { pagination = {}, filteredRowCount = 0 } = uiState;
    const { totalRows, rowsPerPage } = pagination;

    const isPaginated = 'onPageChange' in eventHandlers;
    const isSearching = uiState.searchQuery && uiState.searchQuery.length;

    const count = totalRows ? totalRows : rows.length;

    const noun =
      (isSearching ? 'result' : 'row') +
      (count - filteredRowCount === 1 ? '' : 's');

    const start = !isPaginated
      ? null
      : (pagination.currentPage - 1) * rowsPerPage + 1;

    const end = !isPaginated
      ? null
      : start + rowsPerPage > count - filteredRowCount
      ? count - filteredRowCount
      : start - 1 + rowsPerPage;

    let filterString = !filteredRowCount ? null : (
      <span className="faded"> (filtered from a total of {count})</span>
    );
    const remainingRowCount = !filteredRowCount
      ? count
      : count - filteredRowCount;

    let countString = (
      <span>
        <b>{remainingRowCount}</b> {noun}
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
      <div
        className="RowCounter"
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: '1em',
        }}
      >
        {countString}
        {filterString}
      </div>
    );
  }
}

export default RowCounter;
