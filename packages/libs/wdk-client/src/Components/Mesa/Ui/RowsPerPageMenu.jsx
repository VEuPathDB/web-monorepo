import React from 'react';

import SelectBox from 'wdk-client/Components/Mesa/Components/SelectBox';

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
      5, 10, 20, 50, 100, 500, 1000
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
