import { range } from 'lodash';
import React from 'react';

import Icon from '../Components/Icon';
import RowsPerPageMenu from './RowsPerPageMenu';

const settings = {
  overflowPoint: 8,
  innerRadius: 2,
};

interface PaginationMenuProps {
  totalRows?: number;
  totalPages?: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (numRows: number) => void;
}

type RelativePageType =
  | 'first'
  | 'start'
  | 'last'
  | 'end'
  | 'next'
  | 'prev'
  | 'previous';

class PaginationMenu extends React.PureComponent<PaginationMenuProps> {
  constructor(props: PaginationMenuProps) {
    super(props);
    this.renderEllipsis = this.renderEllipsis.bind(this);
    this.renderPageLink = this.renderPageLink.bind(this);
    this.renderPageList = this.renderPageList.bind(this);
    this.renderPerPageMenu = this.renderPerPageMenu.bind(this);
    this.renderRelativeLink = this.renderRelativeLink.bind(this);
  }

  renderEllipsis(key: string | number = '') {
    return (
      <div key={'ellipsis-' + key} className="ellipsis">
        ...
      </div>
    );
  }

  renderPageLink(page: number, current?: number) {
    let handler = () => this.goToPage(page);
    return (
      <button
        type="button"
        onClick={handler}
        key={page}
        className={current === page ? 'active' : 'inactive'}
      >
        {page.toLocaleString()}
      </button>
    );
  }

  getTotalPages(): number {
    const { rowsPerPage, totalPages, totalRows } = this.props;
    return totalPages || Math.ceil((totalRows || 0) / (rowsPerPage || 1));
  }

  getRelativePageNumber(relative: string): number | null {
    const { currentPage } = this.props;
    const totalPages = this.getTotalPages();
    if (!currentPage) return null;
    switch (relative.toLowerCase()) {
      case 'first':
      case 'start':
        return 1;
      case 'last':
      case 'end':
        return totalPages;
      case 'next':
        return currentPage < totalPages ? currentPage + 1 : 1;
      case 'prev':
      case 'previous':
        return currentPage > 1 ? currentPage - 1 : totalPages;
      default:
        return null;
    }
  }

  getRelativeIcon(relative: string): string | null {
    switch (relative.toLowerCase()) {
      case 'first':
      case 'start':
        return 'angle-double-left';
      case 'last':
      case 'end':
        return 'angle-double-right';
      case 'next':
        return 'caret-right';
      case 'prev':
      case 'previous':
        return 'caret-left';
      default:
        return null;
    }
  }

  goToPage(page: number) {
    let { onPageChange } = this.props;
    if (onPageChange) onPageChange(page);
  }

  renderRelativeLink({ relative }: { relative: RelativePageType }) {
    const page = this.getRelativePageNumber(relative);
    const icon = this.getRelativeIcon(relative);

    return !page || !icon ? null : (
      <span className="Pagination-Nav">
        <button
          type="button"
          onClick={() => this.goToPage(page)}
          title={'Jump to the ' + relative + ' page'}
        >
          <Icon fa={icon} />
        </button>
      </span>
    );
  }

  renderPageList() {
    const { innerRadius } = settings;
    const { currentPage } = this.props;
    const totalPages = this.getTotalPages();

    if (!currentPage) return null;

    const left = Math.max(1, currentPage - innerRadius);
    const right = Math.min(currentPage + innerRadius, totalPages);
    const pageList = range(left, right + 1);

    return (
      <span className="Pagination-Nav">
        {left > 1 && this.renderPageLink(1, currentPage)}
        {left > 2 && this.renderEllipsis(2)}
        {pageList.map((page) => this.renderPageLink(page, currentPage))}
        {right < totalPages - 1 && this.renderEllipsis(totalPages - 1)}
        {right < totalPages && this.renderPageLink(totalPages, currentPage)}
      </span>
    );
  }

  renderPerPageMenu() {
    const { rowsPerPage, rowsPerPageOptions, onRowsPerPageChange } = this.props;
    if (!onRowsPerPageChange || !rowsPerPage) return null;
    return (
      <span className="Pagination-Editor">
        <RowsPerPageMenu
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </span>
    );
  }

  render() {
    const { currentPage, rowsPerPage, totalRows } = this.props;
    const totalPages = this.getTotalPages();

    const PageList = this.renderPageList;
    const PerPageMenu = this.renderPerPageMenu;
    const RelativeLink = this.renderRelativeLink;

    if (!totalPages || !currentPage) return null;

    const showPageList = totalRows && rowsPerPage && totalRows > rowsPerPage;

    return (
      <div className="PaginationMenu">
        <span className="Pagination-Spacer" />
        {showPageList && <RelativeLink relative="previous" />}
        {showPageList && <PageList />}
        {showPageList && <RelativeLink relative="next" />}
        <PerPageMenu />
      </div>
    );
  }
}

export default PaginationMenu;
