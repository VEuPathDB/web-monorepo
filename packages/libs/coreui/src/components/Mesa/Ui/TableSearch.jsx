import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Components/Icon';

class TableSearch extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.clearSearchQuery = this.clearSearchQuery.bind(this);
  }

  handleQueryChange(e) {
    const query = e.target.value;
    const { onSearch } = this.props;
    if (onSearch) onSearch(query);
  }

  clearSearchQuery() {
    const query = null;
    const { onSearch } = this.props;
    if (onSearch) onSearch(query);
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

TableSearch.propTypes = {
  searchQuery: PropTypes.string,
  options: PropTypes.object,
  onSearch: PropTypes.func,
};

export default TableSearch;
