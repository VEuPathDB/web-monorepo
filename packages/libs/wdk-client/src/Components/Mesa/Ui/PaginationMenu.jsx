import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'wdk-client/Components/Mesa/Components/Icon';
import RowsPerPageMenu from 'wdk-client/Components/Mesa/Ui/RowsPerPageMenu';

const settings = {
  overflowPoint: 8,
  innerRadius: 2
}

class PaginationMenu extends React.PureComponent {
  constructor (props) {
    super(props);
    this.renderDynamicPageLink = this.renderDynamicPageLink.bind(this);
    this.renderEllipsis = this.renderEllipsis.bind(this);
    this.renderPageLink = this.renderPageLink.bind(this);
    this.renderPageList = this.renderPageList.bind(this);
    this.renderPerPageMenu = this.renderPerPageMenu.bind(this);
    this.renderRelativeLink = this.renderRelativeLink.bind(this);
  }

  renderEllipsis (key = '') {
    return (
      <div key={'ellipsis-' + key} className="ellipsis">
        ...
      </div>
    );
  }

  renderPageLink (page, current) {
    let handler = () => this.goToPage(page);
    return (
      <button type="button" onClick={handler} key={page} className={current === page ? 'active' : 'inactive'}>
        {page.toLocaleString()}
      </button>
    );
  }

  getTotalPages() {
    const { rowsPerPage, totalPages, totalRows } = this.props;
    return totalPages || Math.ceil(totalRows / rowsPerPage);
  }

  getRelativePageNumber (relative) {
    const { currentPage } = this.props;
    const totalPages = this.getTotalPages();
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

  getRelativeIcon (relative) {
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

  goToPage (page) {
    let { onPageChange } = this.props;
    if (onPageChange) onPageChange(page);
  }

  renderRelativeLink ({ relative }) {
    const page = this.getRelativePageNumber(relative);
    const icon = this.getRelativeIcon(relative);

    return (!page || !icon) ? null : (
      <span className="Pagination-Nav">
        <button type="button" onClick={() => this.goToPage(page)} title={'Jump to the ' + relative + ' page'}>
          <Icon fa={icon} />
        </button>
      </span>
    )
  }

  renderDynamicPageLink (page, current, total) {
    const link = this.renderPageLink(page, current);
    const dots = this.renderEllipsis(page);
    const { innerRadius } = settings;

    if (page === 1 || page === total) return link;
    if (page >= current - innerRadius && page <= current + innerRadius) return link;
    if (page === current - innerRadius - 1) return dots;
    if (page === current + innerRadius + 1) return dots;
    return null;
  }

  renderPageList () {
    const { overflowPoint } = settings;
    const { currentPage } = this.props;
    const totalPages = this.getTotalPages();

    const pageList = new Array(totalPages)
      .fill({})
      .map((empty, index) => index + 1);

    const renderer = totalPages > overflowPoint ? this.renderDynamicPageLink : this.renderPageLink;
    return (
      <span className="Pagination-Nav">
        {pageList.map(page => renderer(page, currentPage, totalPages)).filter(e => e)}
      </span>
    );
  }

  renderPerPageMenu () {
    const { rowsPerPage, rowsPerPageOptions, onRowsPerPageChange } = this.props;
    if (!onRowsPerPageChange) return null;
    return (
      <span className="Pagination-Editor">
        <RowsPerPageMenu
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </span>
    )
  }

  render () {
    const { currentPage, rowsPerPage, totalRows } = this.props;
    const totalPages = this.getTotalPages();

    const PageList = this.renderPageList;
    const PerPageMenu = this.renderPerPageMenu;
    const RelativeLink = this.renderRelativeLink;

    if (!totalPages || !currentPage) return null;

    const showPageList = totalRows > rowsPerPage;

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
};

PaginationMenu.propTypes = {
  totalRows: PropTypes.number,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.array,
  onRowsPerPageChange: PropTypes.func
};

export default PaginationMenu;
