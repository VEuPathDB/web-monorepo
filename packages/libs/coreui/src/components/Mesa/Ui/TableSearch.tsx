import React from 'react';
import Icon from '../Components/Icon';
import { MesaStateProps } from '../types';

interface TableSearchProps<
  Row extends Record<PropertyKey, any> = Record<string, any>,
  Key = string
> {
  searchQuery?: string;
  options?: MesaStateProps<Row, Key>['options'];
  onSearch?: (query: string) => void;
}

class TableSearch<
  Row extends Record<PropertyKey, any> = Record<string, any>,
  Key = string
> extends React.PureComponent<TableSearchProps<Row, Key>> {
  constructor(props: TableSearchProps<Row, Key>) {
    super(props);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.clearSearchQuery = this.clearSearchQuery.bind(this);
  }

  handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    const { onSearch } = this.props;
    if (onSearch) onSearch(query);
  }

  clearSearchQuery() {
    const { onSearch } = this.props;
    if (onSearch) onSearch('');
  }

  render() {
    const { options = {}, searchQuery = '' } = this.props;
    const { searchPlaceholder } = options;
    const { handleQueryChange, clearSearchQuery } = this;

    return (
      <div className="TableSearch">
        <Icon fa={'search'} />
        <input
          type="text"
          name="Search"
          value={searchQuery || ''}
          onChange={handleQueryChange}
          placeholder={searchPlaceholder}
        />
        {searchQuery && (
          <button onClick={clearSearchQuery}>
            <Icon fa={'times-circle'} />
            Clear Search
          </button>
        )}
      </div>
    );
  }
}

export default TableSearch;
