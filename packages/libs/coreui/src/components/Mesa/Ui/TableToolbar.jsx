import React from 'react';

import TableSearch from './TableSearch';
import RowCounter from './RowCounter';

class TableToolbar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.renderTitle = this.renderTitle.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
    this.renderCounter = this.renderCounter.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
    this.renderAddRemoveColumns = this.renderAddRemoveColumns.bind(this);
  }

  renderTitle() {
    const { options } = this.props;
    const { title } = options;

    if (!title) return null;
    return <h1 className="TableToolbar-Title">{title}</h1>;
  }

  renderSearch() {
    const { uiState, eventHandlers, options } = this.props;
    const { onSearch } = eventHandlers;
    const { searchQuery } = uiState;

    if (!onSearch) return null;
    return (
      <TableSearch
        searchQuery={searchQuery}
        onSearch={onSearch}
        options={options}
      />
    );
  }

  renderCounter() {
    const { rows = {}, options = {}, uiState = {}, eventHandlers } = this.props;
    const { showCount, toolbar } = options;

    if (!showCount || !toolbar) return null;

    const props = { rows, uiState, eventHandlers };

    return (
      <div className="TableToolbar-Info">
        <RowCounter {...props} />
      </div>
    );
  }

  renderChildren() {
    const { children } = this.props;
    if (!children) return null;

    return <div className="TableToolbar-Children">{children}</div>;
  }

  renderAddRemoveColumns() {
    return null;
  }

  render() {
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
}

export default TableToolbar;
