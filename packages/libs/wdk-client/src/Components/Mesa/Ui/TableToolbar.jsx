import React from 'react';

import Icon from '../Components/Icon';
import TableSearch from '../Ui/TableSearch';
import RowCounter from '../Ui/RowCounter';

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
    const { options, uiState, eventHandlers } = this.props;
    const { onSearch } = eventHandlers;
    const { searchQuery } = uiState;

    if (!onSearch) return;
    return (
      <TableSearch
        query={searchQuery}
        onSearch={onSearch}
      />
    );
  }

  renderCounter () {
    const { rows, options, uiState, eventHandlers } = this.props;
    const { pagination, filteredRowCount } = uiState;
    const { totalRows, rowsPerPage } = pagination;
    const { showCount } = options;
    if (!showCount) return null;

    const isPaginated = ('onPageChange' in eventHandlers);
    const isSearching = uiState.searchQuery && uiState.searchQuery.length;

    const count = totalRows ? totalRows : rows.length;
    const noun = (isSearching ? 'result' : 'row') + (count % rowsPerPage === 1 ? '' : 's');
    const start = !isPaginated ? null : ((pagination.currentPage - 1) * rowsPerPage) + 1;
    const end = !isPaginated ? null : (start + rowsPerPage > count ? count : (start - 1) + rowsPerPage);

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

  render () {
    const Title = this.renderTitle;
    const Search = this.renderSearch;
    const Counter = this.renderCounter;
    const Children = this.renderChildren;

    return (
      <div className="Toolbar TableToolbar">
        <Title />
        <Search />
        <Counter />
        <Children />
      </div>
    );
  }
};

export default TableToolbar;
