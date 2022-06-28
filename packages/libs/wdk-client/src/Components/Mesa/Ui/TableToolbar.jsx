import React from 'react';

import TableSearch from 'wdk-client/Components/Mesa/Ui/TableSearch';
import RowCounter from 'wdk-client/Components/Mesa/Ui/RowCounter';

class TableToolbar extends React.PureComponent {
  constructor (props) {
    super(props);

    this.renderTitle = this.renderTitle.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
    this.renderCounter = this.renderCounter.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
    this.renderAddRemoveColumns = this.renderAddRemoveColumns.bind(this);
  }

  renderTitle () {
    const { options } = this.props;
    const { title } = options;

    if (!title) return null;
    return (
      <h1 className="TableToolbar-Title">{title}</h1>
    );
  }

  renderSearch () {
    const { uiState, eventHandlers } = this.props;
    const { onSearch } = eventHandlers;
    const { searchQuery } = uiState;

    if (!onSearch) return null;
    return (
      <TableSearch
        query={searchQuery}
        onSearch={onSearch}
      />
    );
  }

  renderCounter () {
    const { rows = {}, options = {}, uiState = {}, eventHandlers } = this.props;
    const { showCount } = options;
    if (!showCount) return null;

    const { pagination = {}, filteredRowCount = 0 } = uiState;
    const { totalRows, rowsPerPage } = pagination;


    const isPaginated = ('onPageChange' in eventHandlers);
    const isSearching = uiState.searchQuery && uiState.searchQuery.length;

    const count = totalRows ? totalRows : rows.length;
    const noun = (isSearching ? 'result' : 'row') + ((count - filteredRowCount) === 1 ? '' : 's');
    const start = !isPaginated ? null : ((pagination.currentPage - 1) * rowsPerPage) + 1;
    const end = !isPaginated ? null : (start + rowsPerPage > (count - filteredRowCount) ? (count - filteredRowCount) : (start - 1) + rowsPerPage);

    const props = { count, noun, start, end, filteredRowCount };

    return (
      <div className="TableToolbar-Info">
        <RowCounter {...props} />
      </div>
    );
  }

  renderChildren () {
    const { children } = this.props;
    if (!children) return null;

    return (
      <div className="TableToolbar-Children">
        {children}
      </div>
    );
  }

  renderAddRemoveColumns() {
    return null;
  }

  render () {
    const Title = this.renderTitle;
    const Search = this.renderSearch;
    const Counter = this.renderCounter;
    const Children = this.renderChildren;

    return (
      <div className="Toolbar TableToolbar">
        <Title />
        <Search />
        <Children />
        <Counter />
      </div>
    );
  }
};

export default TableToolbar;
