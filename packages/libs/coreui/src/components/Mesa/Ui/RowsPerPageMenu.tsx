import React from 'react';

import SelectBox from '../Components/SelectBox';

interface RowsPerPageMenuProps {
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (itemsPerPage: number) => void;
}

class RowsPerPageMenu extends React.PureComponent<RowsPerPageMenuProps> {
  constructor(props: RowsPerPageMenuProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(itemsPerPage: string | number) {
    const { onRowsPerPageChange } = this.props;
    const numItemsPerPage = parseInt(String(itemsPerPage));
    if (onRowsPerPageChange) onRowsPerPageChange(numItemsPerPage);
  }

  render() {
    let { rowsPerPage, rowsPerPageOptions } = this.props;
    if (!rowsPerPageOptions)
      rowsPerPageOptions = [5, 10, 20, 50, 100, 500, 1000];

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
}

export default RowsPerPageMenu;
