import React from 'react';
import PropTypes from 'prop-types';

import DataTable from './DataTable';
import TableToolbar from './TableToolbar';
import ActionToolbar from './ActionToolbar';
import PaginationMenu from './PaginationMenu';
import EmptyState from './EmptyState';

class MesaController extends React.Component {
  constructor(props) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.renderActionBar = this.renderActionBar.bind(this);
    this.renderEmptyState = this.renderEmptyState.bind(this);
    this.renderPaginationMenu = this.renderPaginationMenu.bind(this);
  }

  renderPaginationMenu() {
    const { uiState, eventHandlers } = this.props;

    if (
      !uiState ||
      !eventHandlers ||
      !uiState.pagination ||
      !eventHandlers.onPageChange
    )
      return null;

    return <PaginationMenu {...uiState.pagination} {...eventHandlers} />;
  }

  renderToolbar() {
    const { rows, options, columns, uiState, eventHandlers, children } =
      this.props;
    const props = { rows, options, columns, uiState, eventHandlers, children };
    if (!options || !options.toolbar) return null;

    return <TableToolbar {...props} />;
  }

  renderActionBar() {
    const {
      rows,
      columns,
      options,
      actions,
      uiState,
      eventHandlers,
      children,
    } = this.props;
    let props = { rows, columns, options, actions, uiState, eventHandlers };
    if (!actions || !actions.length) return null;
    if (!this.renderToolbar() && children)
      props = Object.assign({}, props, { children });

    return <ActionToolbar {...props} />;
  }

  renderEmptyState() {
    const { uiState, options } = this.props;
    const { emptinessCulprit } = uiState ? uiState : {};
    const { renderEmptyState } = options ? options : {};

    return renderEmptyState ? (
      renderEmptyState()
    ) : (
      <EmptyState culprit={emptinessCulprit} />
    );
  }

  render() {
    let {
      rows,
      filteredRows,
      options,
      columns,
      actions,
      uiState,
      eventHandlers,
      headerWrapperStyle,
    } = this.props;
    if (!filteredRows) filteredRows = [...rows];
    const props = {
      rows,
      filteredRows,
      options,
      columns,
      actions,
      uiState,
      eventHandlers,
      headerWrapperStyle,
    };

    const Toolbar = this.renderToolbar;
    const ActionBar = this.renderActionBar;
    const PageNav = this.renderPaginationMenu;
    const Empty = this.renderEmptyState;

    const className = (options.className ?? '') + ' Mesa MesaComponent';

    return (
      <div className={className} style={options.style}>
        <Toolbar />
        <ActionBar />
        <PageNav />
        {rows.length ? (
          <React.Fragment>
            <DataTable {...props} />
            {filteredRows.length ? null : <Empty />}
          </React.Fragment>
        ) : (
          <Empty />
        )}
        <PageNav />
      </div>
    );
  }
}

MesaController.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  filteredRows: PropTypes.array,
  options: PropTypes.object,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      element: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
      ]),
      handler: PropTypes.func,
      callback: PropTypes.func,
    })
  ),
  uiState: PropTypes.object,
  eventHandlers: PropTypes.objectOf(PropTypes.func),
};

export default MesaController;
