import React from 'react';

import SelectBox from '../Components/SelectBox';

class RowsPerPageMenu extends React.PureComponent {
  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (itemsPerPage) {
    const { onRowsPerPageChange } = this.props;
    itemsPerPage = parseInt(itemsPerPage);
    if (onRowsPerPageChange) onRowsPerPageChange(itemsPerPage);
  }

  render () {
    let { rowsPerPage, rowsPerPageOptions } = this.props;
    if (!rowsPerPageOptions) rowsPerPageOptions = [
      5, 10, 20, 50, 100,
      { value: 500, name: '500 (slow)'},
      { value: 1000, name: '1000 (very slow)' }
    ];

    return (
      <div className="PaginationEditor">
        <span>Rows per page: </span>
        <SelectBox
          selected={rowsPerPage}
          options={rowsPerPageOptions}
          onChange={this.handleChange}
        />
      </div>
    );
  }
};

export default RowsPerPageMenu;
